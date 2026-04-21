from __future__ import annotations

import asyncio
from difflib import SequenceMatcher
from typing import Any
from urllib.parse import urlparse

import httpx

from core.settings import settings


class NewsAPIVerifier:
    """Validate selected news posts against NewsAPI search results."""

    SOURCE_ALIASES: dict[str, dict[str, list[str]]] = {
        "bbc": {"sources": ["bbc-news"], "domains": ["bbc.com", "bbc.co.uk"], "names": ["bbc news", "bbc"]},
        "reuters": {"sources": ["reuters"], "domains": ["reuters.com"], "names": ["reuters"]},
        "ap": {"sources": ["associated-press"], "domains": ["apnews.com"], "names": ["ap news", "associated press", "ap"]},
        "cnn": {"sources": ["cnn"], "domains": ["cnn.com"], "names": ["cnn"]},
    }

    def __init__(self) -> None:
        self.api_key = settings.newsapi_api_key.strip()
        self.base_url = settings.newsapi_base_url.rstrip("/")
        self.max_results = max(int(getattr(settings, "newsapi_max_results", 5)), 1)
        self.timeout_seconds = max(int(getattr(settings, "request_timeout_seconds", 30)), 5)

    async def enrich_posts(self, posts: list[dict], query: str) -> list[dict]:
        if not posts:
            return posts

        eligible_indexes = [index for index, post in enumerate(posts) if self._is_verifiable_news_post(post)]
        if not eligible_indexes:
            return posts

        if not self.api_key:
            disabled = self._disabled_result(query)
            for index in eligible_indexes:
                posts[index]["sourceVerification"] = dict(disabled)
            return posts

        async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
            tasks = [self._verify_post(posts[index], query, client) for index in eligible_indexes]
            results = await asyncio.gather(*tasks, return_exceptions=True)

        for index, verification in zip(eligible_indexes, results):
            if isinstance(verification, Exception):
                verification = self._result(
                    status="unmatched",
                    message="NewsAPI verification failed for this source.",
                    source_url=self._first_url(posts[index]),
                    query_used=query,
                )
            posts[index]["sourceVerification"] = verification

        return posts

    async def _verify_post(self, post: dict, query: str, client: httpx.AsyncClient) -> dict[str, Any]:
        source_url = self._first_url(post)
        search_query = self._build_query(post, query)
        source_hint = self._resolve_source_hint(post, source_url)
        source_domain = source_hint.get("domain") or self._extract_domain(source_url or post.get("sourceName") or post.get("username") or "")

        try:
            articles = await self._search_newsapi(client, search_query, source_domain, source_hint)
        except Exception:
            return self._result(
                status="unmatched",
                message="NewsAPI lookup failed for this source.",
                source_url=source_url,
                query_used=search_query,
            )

        if not articles:
            return self._result(
                status="unmatched",
                message="No NewsAPI article matched this source.",
                source_url=source_url,
                query_used=search_query,
            )

        best_article = None
        best_score = 0.0
        for article in articles:
            score = self._score_match(source_url, post.get("text", ""), article, source_hint)
            if score > best_score:
                best_score = score
                best_article = article

        if not best_article:
            return self._result(
                status="unmatched",
                message="NewsAPI returned results, but none were a strong match.",
                source_url=source_url,
                query_used=search_query,
            )

        matched_url = best_article.get("url") or None
        matched_title = best_article.get("title") or None
        matched_source = ((best_article.get("source") or {}).get("name") or None)
        exact_url_match = self._normalize_url(source_url or "") == self._normalize_url(matched_url or "") if source_url and matched_url else False
        domain_match = bool(source_url and matched_url and self._extract_domain(source_url) == self._extract_domain(matched_url))
        source_name_match = self._source_name_matches(source_hint, matched_source)

        if exact_url_match or (domain_match and source_name_match and best_score >= 0.8):
            status = "verified"
            message = "NewsAPI confirmed this source article."
            confidence = min(1.0, round(best_score if not exact_url_match else 1.0, 2))
        elif best_score >= 0.74:
            status = "ambiguous"
            message = "NewsAPI found a close match, but the proof is not exact."
            confidence = round(best_score, 2)
        else:
            status = "unmatched"
            message = "NewsAPI could not confidently confirm this source."
            confidence = round(best_score, 2)

        return self._result(
            status=status,
            message=message,
            confidence=confidence,
            source_url=source_url,
            query_used=search_query,
            matched_title=matched_title,
            matched_url=matched_url,
            matched_source=matched_source,
        )

    async def _search_newsapi(
        self,
        client: httpx.AsyncClient,
        query: str,
        source_domain: str | None,
        source_hint: dict[str, list[str] | str] | None = None,
    ) -> list[dict[str, Any]]:
        params: dict[str, Any] = {
            "apiKey": self.api_key,
            "qInTitle": query,
            "pageSize": self.max_results,
            "language": "en",
            "sortBy": "relevancy",
        }
        if source_domain:
            params["domains"] = source_domain
        if source_hint and source_hint.get("source"):
            params["sources"] = source_hint["source"]

        response = await client.get(self.base_url, params=params)
        response.raise_for_status()
        payload = response.json()
        articles = payload.get("articles") or []
        return [article for article in articles if isinstance(article, dict)]

    def _is_verifiable_news_post(self, post: dict) -> bool:
        if post.get("platform") == "news_rss":
            return True
        source_name = str(post.get("sourceName") or post.get("username") or "").lower()
        return any(token in source_name for token in ("bbc", "reuters", "ap news", "associated press", "cnn", "news"))

    def _build_query(self, post: dict, fallback_query: str) -> str:
        text = str(post.get("text") or "").strip()
        if text:
            return text[:120]
        return fallback_query[:120]

    def _score_match(
        self,
        source_url: str | None,
        post_title: str,
        article: dict[str, Any],
        source_hint: dict[str, list[str] | str] | None = None,
    ) -> float:
        article_title = str(article.get("title") or "")
        article_url = str(article.get("url") or "")
        source_name = str((article.get("source") or {}).get("name") or "")

        title_score = SequenceMatcher(None, self._normalize_text(post_title), self._normalize_text(article_title)).ratio()
        url_score = 1.0 if source_url and self._normalize_url(source_url) == self._normalize_url(article_url) else 0.0
        domain_score = 1.0 if source_url and self._extract_domain(source_url) == self._extract_domain(article_url) else 0.0
        source_score = 0.2 if source_name else 0.0
        hint_score = 0.0
        if source_hint:
            hint_score = 0.2 if self._source_name_matches(source_hint, source_name) else 0.0

        return min(max((0.5 * title_score) + (0.3 * domain_score) + (0.15 * url_score) + source_score + hint_score, 0.0), 1.0)

    def _result(
        self,
        *,
        status: str,
        message: str,
        source_url: str | None,
        query_used: str,
        confidence: float | None = None,
        matched_title: str | None = None,
        matched_url: str | None = None,
        matched_source: str | None = None,
    ) -> dict[str, Any]:
        return {
            "provider": "NewsAPI",
            "status": status,
            "message": message,
            "confidence": confidence,
            "queryUsed": query_used,
            "matchedTitle": matched_title,
            "matchedUrl": matched_url,
            "matchedSource": matched_source,
            "sourceUrl": source_url,
        }

    def _disabled_result(self, query: str) -> dict[str, Any]:
        return self._result(
            status="disabled",
            message="NewsAPI verification is disabled because no API key is configured.",
            source_url=None,
            query_used=query,
            confidence=None,
        )

    def _resolve_source_hint(self, post: dict, source_url: str | None) -> dict[str, list[str] | str]:
        source_name = str(post.get("sourceName") or post.get("username") or "").lower()
        domain = self._extract_domain(source_url or source_name)

        for token, alias in self.SOURCE_ALIASES.items():
            if token in source_name or (domain and any(domain.endswith(candidate) for candidate in alias["domains"])):
                return {"source": alias["sources"][0], "domain": alias["domains"][0], "names": alias["names"]}

        return {"source": "", "domain": domain, "names": [source_name] if source_name else []}

    def _source_name_matches(self, source_hint: dict[str, list[str] | str] | None, matched_source: str | None) -> bool:
        if not source_hint or not matched_source:
            return False

        matched_name = matched_source.lower()
        allowed_names = [name.lower() for name in source_hint.get("names", []) if isinstance(name, str)]
        return any(name in matched_name or matched_name in name for name in allowed_names)

    @staticmethod
    def _first_url(post: dict) -> str | None:
        url = post.get("url")
        if isinstance(url, str) and url.strip():
            return url.strip()

        urls = post.get("urls") or []
        for item in urls:
            if isinstance(item, str) and item.strip():
                return item.strip()
        return None

    @staticmethod
    def _normalize_text(value: str) -> str:
        return " ".join(value.lower().split())

    @staticmethod
    def _normalize_url(value: str) -> str:
        parsed = urlparse(value.strip())
        netloc = parsed.netloc.lower().removeprefix("www.")
        path = parsed.path.rstrip("/")
        return f"{netloc}{path}".lower()

    @staticmethod
    def _extract_domain(value: str) -> str:
        if not value:
            return ""
        parsed = urlparse(value if "://" in value else f"https://{value}")
        domain = parsed.netloc.lower().removeprefix("www.")
        return domain