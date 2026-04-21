from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.0-flash"

    google_news_max_results: int = 40
    gdelt_max_results: int = 40
    commoncrawl_max_results: int = 1000  # Web-scale search: up to 1000 pages max
    commoncrawl_timeout: int = 30  # Allow extra time for web-scale queries result

    telegram_api_id: str = ""
    telegram_api_hash: str = ""
    telegram_bot_token: str = ""
    telegram_channels: str = "bbcnews,cnn,reuters"
    telegram_max_results: int = 40

    twitter_bearer_token: str = ""
    twitter_max_results: int = 100

    facebook_access_token: str = ""
    facebook_app_id: str = ""
    facebook_app_secret: str = ""
    facebook_max_results: int = 50

    newsapi_api_key: str = ""
    newsapi_base_url: str = "https://newsapi.org/v2/everything"
    newsapi_max_results: int = 5

    request_timeout_seconds: int = 30
    frontend_origin: str = "http://localhost:3000"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
