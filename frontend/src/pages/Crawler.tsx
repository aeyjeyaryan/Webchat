import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { 
  Globe, 
  Search, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  ArrowRight
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Badge from '../components/common/Badge';
import { useToast } from '../components/common/ToastContainer';
import { crawlWebsite } from '../services/crawlerService';

interface CrawlFormData {
  url: string;
  depth: string;
}

interface CrawlHistory {
  id: string;
  url: string;
  timestamp: Date;
  status: 'success' | 'error' | 'pending';
  pages?: number;
  error?: string;
}

const Crawler = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [crawlHistory, setCrawlHistory] = useState<CrawlHistory[]>([]);
  const { showToast } = useToast();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CrawlFormData>({
    defaultValues: {
      url: '',
      depth: 'basic',
    },
  });
  
  const onSubmit = async (data: CrawlFormData) => {
    setIsLoading(true);
    
    // Add to history with pending status
    const newCrawl: CrawlHistory = {
      id: Date.now().toString(),
      url: data.url,
      timestamp: new Date(),
      status: 'pending',
    };
    
    setCrawlHistory((prev) => [newCrawl, ...prev]);
    
    try {
      const result = await crawlWebsite(data.url);
      
      // Update history with success
      setCrawlHistory((prev) =>
        prev.map((item) =>
          item.id === newCrawl.id
            ? {
                ...item,
                status: 'success',
                pages: Math.floor(Math.random() * 30) + 5, // Mock data
              }
            : item
        )
      );
      
      showToast({
        type: 'success',
        title: 'Crawl Successful',
        message: `Successfully crawled ${data.url}`,
      });
      
      reset();
    } catch (error) {
      // Update history with error
      setCrawlHistory((prev) =>
        prev.map((item) =>
          item.id === newCrawl.id
            ? {
                ...item,
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error',
              }
            : item
        )
      );
      
      showToast({
        type: 'error',
        title: 'Crawl Failed',
        message: error instanceof Error ? error.message : 'Failed to crawl website',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    
    return Math.floor(seconds) + ' seconds ago';
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="success">Success</Badge>;
      case 'error':
        return <Badge variant="danger">Error</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      default:
        return null;
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Web Crawler</h1>
        <p className="mt-2 text-gray-600">
          Crawl websites to extract and index content for AI queries
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card title="Crawl a Website">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Website URL"
                type="url"
                id="url"
                placeholder="https://example.com"
                icon={<Globe size={18} />}
                error={errors.url?.message}
                {...register('url', {
                  required: 'URL is required',
                  pattern: {
                    value: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
                    message: 'Please enter a valid URL',
                  },
                })}
              />
              
              <div>
                <label className="form-label">Crawl Depth</label>
                <div className="mt-1 space-y-2">
                  <div className="flex items-center">
                    <input
                      id="basic"
                      type="radio"
                      value="basic"
                      className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                      {...register('depth')}
                    />
                    <label htmlFor="basic" className="ml-2 block text-sm text-gray-700">
                      Basic (homepage and direct links)
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="advanced"
                      type="radio"
                      value="advanced"
                      className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                      {...register('depth')}
                    />
                    <label htmlFor="advanced" className="ml-2 block text-sm text-gray-700">
                      Advanced (deep crawl, all pages)
                    </label>
                  </div>
                </div>
              </div>
              
              <Button
                type="submit"
                fullWidth
                isLoading={isLoading}
                icon={<Search size={18} />}
              >
                Start Crawling
              </Button>
            </form>
          </Card>
          
          <Card title="Crawling Tips" className="mt-6">
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <ArrowRight size={16} className="mt-0.5 mr-2 text-primary" />
                Ensure the website allows crawling in its robots.txt file
              </li>
              <li className="flex items-start">
                <ArrowRight size={16} className="mt-0.5 mr-2 text-primary" />
                Advanced crawling may take longer for large websites
              </li>
              <li className="flex items-start">
                <ArrowRight size={16} className="mt-0.5 mr-2 text-primary" />
                Some websites may block automated crawling attempts
              </li>
              <li className="flex items-start">
                <ArrowRight size={16} className="mt-0.5 mr-2 text-primary" />
                Crawled content is stored in your knowledge base for querying
              </li>
            </ul>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <Card title="Crawl History">
            {crawlHistory.length === 0 ? (
              <div className="py-8 text-center">
                <Globe className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No crawls yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Start by crawling a website using the form on the left
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {crawlHistory.map((crawl) => (
                  <div key={crawl.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{crawl.url}</p>
                        <div className="mt-1 flex items-center text-xs text-gray-500">
                          <Clock size={12} className="mr-1" />
                          {formatTimeAgo(crawl.timestamp)}
                          
                          {crawl.status === 'success' && (
                            <span className="ml-3">
                              {crawl.pages} pages indexed
                            </span>
                          )}
                          
                          {crawl.status === 'error' && (
                            <span className="ml-3 text-red-500">
                              {crawl.error}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center">
                        {getStatusBadge(crawl.status)}
                        
                        {crawl.status === 'success' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-3"
                            onClick={() => {
                              // Navigate to chat with this URL
                              // This would be implemented with useNavigate in a real app
                              showToast({
                                type: 'info',
                                message: 'Navigating to chat with this URL',
                              });
                            }}
                          >
                            Query
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default Crawler;