from services.newsapi_verifier import NewsAPIVerifier


def test_verifier_marks_disabled_without_key(monkeypatch) -> None:
    monkeypatch.setattr("services.newsapi_verifier.settings.newsapi_api_key", "")
    verifier = NewsAPIVerifier()

    posts = [
        {
            "id": "p1",
            "platform": "news_rss",
            "username": "BBC News",
            "text": "BBC headline",
            "urls": ["https://www.bbc.com/news/example"],
        }
    ]

    import asyncio

    enriched = asyncio.run(verifier.enrich_posts(posts, "sample claim"))

    assert enriched[0]["sourceVerification"]["status"] == "disabled"


def test_verifier_attaches_lookup_result(monkeypatch) -> None:
    monkeypatch.setattr("services.newsapi_verifier.settings.newsapi_api_key", "test-key")
    verifier = NewsAPIVerifier()

    async def fake_search(self, client, query, source_domain, source_hint=None):
        return [
            {
                "title": "BBC headline",
                "url": "https://www.bbc.com/news/example",
                "source": {"name": "BBC News"},
            }
        ]

    monkeypatch.setattr(NewsAPIVerifier, "_search_newsapi", fake_search)

    posts = [
        {
            "id": "p1",
            "platform": "news_rss",
            "username": "BBC News",
            "text": "BBC headline",
            "urls": ["https://www.bbc.com/news/example"],
        }
    ]

    import asyncio

    enriched = asyncio.run(verifier.enrich_posts(posts, "sample claim"))

    proof = enriched[0]["sourceVerification"]
    assert proof["status"] in {"verified", "ambiguous"}
    assert proof["matchedUrl"] == "https://www.bbc.com/news/example"


def test_verifier_prefers_canonical_source_alias(monkeypatch) -> None:
    monkeypatch.setattr("services.newsapi_verifier.settings.newsapi_api_key", "test-key")
    verifier = NewsAPIVerifier()

    async def fake_search(self, client, query, source_domain, source_hint=None):
        assert source_hint is not None
        assert source_hint["source"] in {"associated-press", "bbc-news", "reuters", "cnn"}
        return [
            {
                "title": "AP headline",
                "url": "https://apnews.com/article/example",
                "source": {"name": "AP News"},
            }
        ]

    monkeypatch.setattr(NewsAPIVerifier, "_search_newsapi", fake_search)

    posts = [
        {
            "id": "p1",
            "platform": "news_rss",
            "username": "AP News",
            "text": "AP headline",
            "urls": ["https://apnews.com/article/example"],
        }
    ]

    import asyncio

    enriched = asyncio.run(verifier.enrich_posts(posts, "sample claim"))

    proof = enriched[0]["sourceVerification"]
    assert proof["status"] == "verified"
    assert proof["matchedSource"] == "AP News"