
# from crawl4ai import AsyncWebCrawler
# import logging
# from typing import Dict
# from urllib.parse import urlparse, urlunparse
# from pydantic import HttpUrl

# # Configure logging
# logger = logging.getLogger(__name__)

# # In-memory knowledge base
# knowledge_base: Dict[str, str] = {}

# async def crawl_website(url: str | HttpUrl) -> None:
#     """Crawl a website and store its markdown content."""
#     logger.info(f"Received URL: '{url}', type: {type(url)}")
    
#     # Convert HttpUrl to string if necessary
#     url_str = str(url) if isinstance(url, HttpUrl) else url
#     logger.info(f"Converted URL: '{url_str}', type: {type(url_str)}")
    
#     # Normalize URL (remove trailing slash, query, fragment)
#     parsed = urlparse(url_str)
#     normalized_url = urlunparse((parsed.scheme, parsed.netloc, parsed.path.rstrip('/'), '', '', ''))
#     logger.info(f"Normalized URL: '{normalized_url}'")
    
#     # Explicit URL validation
#     if not normalized_url or not isinstance(normalized_url, str):
#         logger.error(f"URL validation failed: '{normalized_url}'")
#         raise ValueError("Invalid URL, make sure the URL is a non-empty string")
    
#     # Basic URL format check
#     parsed_url = urlparse(normalized_url)
#     if not parsed_url.scheme or not parsed_url.netloc:
#         logger.error(f"Invalid URL format: '{normalized_url}' (scheme: {parsed_url.scheme}, netloc: {parsed_url.netloc})")
#         raise ValueError("Invalid URL, must include scheme (e.g., https) and domain")

#     try:
#         async with AsyncWebCrawler(verbose=True, user_agent="MyCrawler/1.0") as crawler:
#             logger.info(f"Starting crawl for {normalized_url}")
#             result = await crawler.arun(url=normalized_url)
#             if not result.success:
#                 logger.error(f"Crawl failed for {normalized_url}: {result.error_message}")
#                 raise ValueError(f"Failed to crawl the website: {result.error_message}")
#             knowledge_base[normalized_url] = result.markdown
#             logger.info(f"Successfully crawled and stored content for {normalized_url}")
#             logger.info(f"Current knowledge_base keys: {list(knowledge_base.keys())}")
#     except Exception as e:
#         logger.error(f"Crawling failed for {normalized_url}: {type(e).__name__}: {str(e)}")
#         raise
from crawl4ai import AsyncWebCrawler
import logging
from typing import Dict
from urllib.parse import urlparse, urlunparse
from pydantic import HttpUrl
from fastapi import HTTPException
import asyncio

# Configure logging
logger = logging.getLogger(__name__)

# In-memory knowledge base
knowledge_base: Dict[str, str] = {}

async def crawl_website(url: str | HttpUrl) -> None:
    """Crawl a website and store its markdown content."""
    logger.info(f"Received URL: '{url}', type: {type(url)}")
    
    # Convert HttpUrl to string if necessary
    url_str = str(url) if isinstance(url, HttpUrl) else url
    logger.info(f"Converted URL: '{url_str}', type: {type(url_str)}")
    
    # Normalize URL (remove trailing slash, query, fragment)
    parsed = urlparse(url_str)
    normalized_url = urlunparse((parsed.scheme, parsed.netloc, parsed.path.rstrip('/'), '', '', ''))
    logger.info(f"Normalized URL: '{normalized_url}'")
    
    # Explicit URL validation
    if not normalized_url or not isinstance(normalized_url, str):
        logger.error(f"URL validation failed: '{normalized_url}'")
        raise ValueError("Invalid URL, make sure the URL is a non-empty string")
    
    # Basic URL format check
    parsed_url = urlparse(normalized_url)
    if not parsed_url.scheme or not parsed_url.netloc:
        logger.error(f"Invalid URL format: '{normalized_url}' (scheme: {parsed_url.scheme}, netloc: {parsed_url.netloc})")
        raise ValueError("Invalid URL, must include scheme (e.g., https) and domain")

    try:
        async with AsyncWebCrawler(verbose=True, user_agent="MyCrawler/1.0") as crawler:
            logger.info(f"Starting crawl for {normalized_url}")
            # Run crawl with timeout, browser args, and error handling
            result = await asyncio.wait_for(
                crawler.arun(
                    url=normalized_url,
                    headless=True,
                    browser_args=[
                        "--no-sandbox",
                        "--disable-gpu",
                        "--disable-setuid-sandbox",
                        "--disable-webrtc",
                        "--disable-dev-shm-usage"
                    ]
                ),
                timeout=60  # Increased to 60 seconds
            )
            if not result.success:
                logger.error(f"Crawl failed for {normalized_url}: {result.error_message}")
                raise HTTPException(status_code=500, detail=f"Failed to crawl the website: {result.error_message}")
            knowledge_base[normalized_url] = result.markdown
            logger.info(f"Successfully crawled and stored content for {normalized_url}")
            logger.info(f"Current knowledge_base keys: {list(knowledge_base.keys())}")
    except asyncio.TimeoutError:
        logger.error(f"Crawling timed out for {normalized_url} after 60 seconds")
        raise HTTPException(status_code=504, detail="Crawling timed out after 60 seconds")
    except Exception as e:
        logger.error(f"Crawling failed for {normalized_url}: {type(e).__name__}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Crawling failed: {type(e).__name__}: {str(e)}")