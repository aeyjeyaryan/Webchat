import pytest
import asyncio
from src.crawler import crawl_website, knowledge_base

@pytest.mark.asyncio
async def test_crawl_website():
    url = "https://example.com"
    await crawl_website(url)
    assert url in knowledge_base
    assert isinstance(knowledge_base[url], str)