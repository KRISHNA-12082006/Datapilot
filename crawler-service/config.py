from pydantic_settings import BaseSettings
from typing import List, Optional
import os

from dotenv import load_dotenv

# Load keys (NVIDIA_API_KEY, …) into os.environ, which utils.common.env() reads.
# crawler-service/.env wins over the project-root .env shared with Next.js;
# real environment variables win over both.
_HERE = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(_HERE, ".env"))
load_dotenv(os.path.join(_HERE, "..", ".env"))


class Settings(BaseSettings):
    # Service
    HOST: str = "0.0.0.0"
    PORT: int = 8001
    LOG_LEVEL: str = "INFO"

    # Playwright
    PLAYWRIGHT_HEADLESS: bool = True
    PLAYWRIGHT_TIMEOUT: int = 90000
    PLAYWRIGHT_MAX_CONCURRENT: int = 2

    # HTTP
    HTTP_TIMEOUT: int = 30
    USER_AGENT: str = (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0 Safari/537.36"
    )

    # Rate limiting
    MIN_DELAY: float = 1.5
    MAX_DELAY: float = 4.0

    # Platform toggles
    ENABLED_PLATFORMS: List[str] = [
        "rss", "bbcnews", "thehackernews", "techmeme", "mashable",
        "reddit", "hackernews", "stackoverflow", "medium", "devto",
        "quora", "substack", "github", "gitlab",
        "trustpilot", "googleplay", "appstore", "amazon", "yelp",
        "bluesky", "mastodon", "telegram", "threads", "youtube",
    ]

    # Fallback
    ENABLE_FALLBACK: bool = True
    MAX_RECORDS_PER_PLATFORM: int = 50

    # Database (shared with DataPilot)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True
        extra = "ignore"  # .env also holds keys this class doesn't declare


settings = Settings()