from schemas.contracts import AnalyzeResponse


def test_response_contract_minimal() -> None:
    payload = AnalyzeResponse(
        query="sample claim",
        finalScore=55,
        riskLevel="Medium",
        summary="test",
        layers=[
            {"name": "NLP", "score": 50, "explanation": "a"},
            {"name": "GNN", "score": 60, "explanation": "b"},
            {"name": "ML-FactCheck", "score": 55, "explanation": "c"},
        ],
        nodes=[{"id": "a1", "label": "@x", "followers": 1, "cluster": 1}],
        links=[{"source": "a1", "target": "a1", "kind": "semantic"}],
        posts=[
            {
                "id": "p1",
                "username": "@x",
                "timestamp": "now",
                "text": "hello",
                "likes": 0,
                "shares": 0,
                "url": "https://example.com/article",
                "sourceName": "BBC News",
                "sourceVerification": {
                    "provider": "NewsAPI",
                    "status": "verified",
                    "message": "matched",
                    "confidence": 0.91,
                    "queryUsed": "sample claim",
                    "matchedTitle": "Example Article",
                    "matchedUrl": "https://example.com/article",
                    "matchedSource": "BBC News",
                },
            }
        ],
    )
    assert payload.finalScore == 55
    assert payload.posts[0].url == "https://example.com/article"
