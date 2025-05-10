# # import google.generativeai as genai
# # import logging
# # from crawler import knowledge_base
# # from config import GEMINI_API_KEY

# # # Configure logging
# # logger = logging.getLogger(__name__)

# # # Configure Gemini API
# # genai.configure(api_key=GEMINI_API_KEY)

# # async def query_website(url: str, query: str) -> str:
# #     """Query the LLM with website content and user query."""
# #     if url not in knowledge_base:
# #         raise ValueError("URL not found. Please crawl the website first.")
    
# #     try:
# #         context = knowledge_base[url]
# #         model = genai.GenerativeModel("gemini-1.5-flash")
# #         prompt = f"""
# #         You are an assistant with access to the content of a website. The website content is provided below as markdown.
# #         Answer the user's query based on this content. If the query cannot be answered with the provided content, 
# #         say so and provide a general response if possible.
# #         Website Content:
# #         {context}
# #         User Query:
# #         {query}
# #         """
# #         response = model.generate_content(prompt)
# #         return response.text
# #     except Exception as e:
# #         logger.error(f"LLM query failed for {url}: {str(e)}")
# #         raise

# import google.generativeai as genai
# import logging
# from crawler import knowledge_base
# from config import GEMINI_API_KEY
# from urllib.parse import urlparse, urlunparse

# # Configure logging
# logger = logging.getLogger(__name__)

# # Configure Gemini API
# genai.configure(api_key=GEMINI_API_KEY)

# async def query_website(url: str, query: str) -> str:
#     """Query the LLM with website content and user query."""
#     # Normalize URL (remove trailing slash, query, fragment)
#     parsed = urlparse(url)
#     normalized_url = urlunparse((parsed.scheme, parsed.netloc, parsed.path.rstrip('/'), '', '', ''))
#     logger.info(f"Querying with normalized URL: '{normalized_url}'")
    
#     if normalized_url not in knowledge_base:
#         logger.warning(f"URL not found in knowledge_base: '{normalized_url}'")
#         raise ValueError("URL not found. Please crawl the website first.")
    
#     try:
#         context = knowledge_base[normalized_url]
#         model = genai.GenerativeModel("gemini-1.5-flash")
#         prompt = f"""
#         You are an assistant with access to the content of a website. The website content is provided below as markdown.
#         Answer the user's query based on this content. If the query cannot be answered with the provided content, 
#         say so and provide a general response if possible.
#         Website Content:
#         {context}
#         User Query:
#         {query}
#         """
#         response = model.generate_content(prompt)
#         return response.text
#     except Exception as e:
#         logger.error(f"LLM query failed for {normalized_url}: {str(e)}")
#         raise

import google.generativeai as genai
import logging
from src.crawler import knowledge_base
from config import GEMINI_API_KEY
from urllib.parse import urlparse, urlunparse

# Configure logging
logger = logging.getLogger(__name__)

# Configure Gemini API
genai.configure(api_key=GEMINI_API_KEY)

async def query_website(url: str, query: str) -> str:
    """Query the LLM with website content and user query."""
    # Normalize URL (remove trailing slash, query, fragment)
    parsed = urlparse(url)
    normalized_url = urlunparse((parsed.scheme, parsed.netloc, parsed.path.rstrip('/'), '', '', ''))
    logger.info(f"Querying with normalized URL: '{normalized_url}'")
    
    if normalized_url not in knowledge_base:
        logger.warning(f"URL not found in knowledge_base: '{normalized_url}'")
        raise ValueError("URL not found. Please crawl the website first.")
    
    try:
        context = knowledge_base[normalized_url]
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = f"""
        You are an assistant with access to the content of a website. You are the part of a website called Webchat and your name is Pluto and you were created by Aryan. Do not use any words like Based on the content, or anything like that. 
        The website content is provided below as markdown. If the user gets off track, try to bring them back to the track and stick to the URL content.
        Answer the user's query based on this content. If the query cannot be answered with the provided content, 
        say so and provide a general response if possible. 
        Website Content:
        {context}
        User Query:
        {query}
        """
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        logger.error(f"LLM query failed for {normalized_url}: {str(e)}")
        raise