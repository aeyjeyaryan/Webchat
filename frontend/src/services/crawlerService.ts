import api from './api';

interface CrawlResponse {
  message: string;
  url: string;
}

interface QueryResponse {
  response: string;
  url: string;
}

interface KnowledgeBaseResponse {
  knowledge_base: {
    url: string;
  };
}

export const crawlWebsite = async (url: string): Promise<CrawlResponse> => {
  try {
    const response = await api.post<CrawlResponse>('/crawl', { url });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data?.detail || 'Failed to crawl website');
    }
    throw new Error('Network error. Please try again.');
  }
};

export const queryContent = async (url: string, query: string): Promise<QueryResponse> => {
  try {
    const response = await api.post<QueryResponse>('/query', { url, query });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data?.detail || 'Failed to query content');
    }
    throw new Error('Network error. Please try again.');
  }
};

export const getKnowledgeBase = async (): Promise<KnowledgeBaseResponse> => {
  try {
    const response = await api.get<KnowledgeBaseResponse>('/knowledge');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data?.detail || 'Failed to fetch knowledge base');
    }
    throw new Error('Network error. Please try again.');
  }
};

// Import axios for type checking
import axios from 'axios';