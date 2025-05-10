import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Globe, 
  MessageCircle, 
  Database, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

interface RecentActivity {
  id: string;
  type: 'crawl' | 'query' | 'knowledge';
  url: string;
  status: 'success' | 'error' | 'pending';
  timestamp: Date;
  details?: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    crawledSites: 0,
    queries: 0,
    knowledgeItems: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  
  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      // Mock data for demonstration
      setStats({
        crawledSites: 12,
        queries: 48,
        knowledgeItems: 8,
      });
      
      setRecentActivity([
        {
          id: '1',
          type: 'crawl',
          url: 'https://example.com',
          status: 'success',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          details: 'Successfully crawled 24 pages',
        },
        {
          id: '2',
          type: 'query',
          url: 'https://example.com',
          status: 'success',
          timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
          details: 'What are the main products?',
        },
        {
          id: '3',
          type: 'knowledge',
          url: 'https://docs.example.com',
          status: 'success',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          details: 'Added to knowledge base',
        },
        {
          id: '4',
          type: 'crawl',
          url: 'https://blog.example.com',
          status: 'error',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
          details: 'Failed to access site: 403 Forbidden',
        },
      ]);
      
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
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
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'crawl':
        return <Globe className="h-5 w-5 text-primary" />;
      case 'query':
        return <MessageCircle className="h-5 w-5 text-secondary" />;
      case 'knowledge':
        return <Database className="h-5 w-5 text-accent" />;
      default:
        return null;
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="success" size="sm">Success</Badge>;
      case 'error':
        return <Badge variant="danger" size="sm">Error</Badge>;
      case 'pending':
        return <Badge variant="warning" size="sm">Pending</Badge>;
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
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back, {user?.email.split('@')[0]}! Here's an overview of your activity.
        </p>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-primary/20 text-primary">
                <Globe size={24} />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Crawled Sites</h3>
                <p className="text-3xl font-bold text-primary">{stats.crawledSites}</p>
              </div>
            </div>
            <div className="mt-4">
              <Link to="/crawler">
                <Button variant="outline" size="sm" fullWidth>
                  Crawl New Site
                </Button>
              </Link>
            </div>
          </Card>
          
          <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-secondary/20 text-secondary">
                <MessageCircle size={24} />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">AI Queries</h3>
                <p className="text-3xl font-bold text-secondary">{stats.queries}</p>
              </div>
            </div>
            <div className="mt-4">
              <Link to="/chat">
                <Button variant="outline" size="sm" fullWidth>
                  New Query
                </Button>
              </Link>
            </div>
          </Card>
          
          <Card className="bg-gradient-to-br from-accent/10 to-accent/5">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-accent/20 text-accent">
                <Database size={24} />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Knowledge Base</h3>
                <p className="text-3xl font-bold text-accent">{stats.knowledgeItems}</p>
              </div>
            </div>
            <div className="mt-4">
              <Link to="/knowledge">
                <Button variant="outline" size="sm" fullWidth>
                  View Knowledge Base
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Recent Activity" className="lg:col-span-2">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="mr-3">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {activity.url}
                        </p>
                        <p className="text-xs text-gray-500">{activity.details}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {getStatusBadge(activity.status)}
                      <span className="ml-3 text-xs text-gray-500 flex items-center">
                        <Clock size={12} className="mr-1" />
                        {formatTimeAgo(activity.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </motion.div>
  );
};

export default Dashboard;