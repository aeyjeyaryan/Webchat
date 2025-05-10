import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Database, 
  Search, 
  Grid, 
  List, 
  Filter, 
  ExternalLink,
  Trash2,
  Download,
  Clock,
  Tag
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Badge from '../components/common/Badge';
import { useToast } from '../components/common/ToastContainer';
import { getKnowledgeBase } from '../services/crawlerService';

interface KnowledgeItem {
  id: string;
  url: string;
  title: string;
  description: string;
  crawledAt: Date;
  pageCount: number;
  tags: string[];
  thumbnail?: string;
}

const KnowledgeBase = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const { showToast } = useToast();
  
  useEffect(() => {
    const fetchKnowledgeBase = async () => {
      setIsLoading(true);
      try {
        await getKnowledgeBase();
        
        // Mock data for demonstration
        const mockData: KnowledgeItem[] = [
          {
            id: '1',
            url: 'https://example.com',
            title: 'Example Website',
            description: 'Main company website with product information and documentation.',
            crawledAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
            pageCount: 24,
            tags: ['company', 'products'],
            thumbnail: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
          },
          {
            id: '2',
            url: 'https://docs.example.com',
            title: 'Documentation Portal',
            description: 'Technical documentation for developers and API reference guides.',
            crawledAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
            pageCount: 56,
            tags: ['docs', 'technical', 'api'],
            thumbnail: 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
          },
          {
            id: '3',
            url: 'https://blog.example.com',
            title: 'Company Blog',
            description: 'Latest news, updates, and technical articles from the team.',
            crawledAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
            pageCount: 18,
            tags: ['blog', 'news'],
            thumbnail: 'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
          },
          {
            id: '4',
            url: 'https://support.example.com',
            title: 'Support Center',
            description: 'Customer support resources, FAQs, and troubleshooting guides.',
            crawledAt: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
            pageCount: 32,
            tags: ['support', 'help'],
            thumbnail: 'https://images.pexels.com/photos/1181673/pexels-photo-1181673.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
          },
        ];
        
        setKnowledgeItems(mockData);
        
        // Extract all unique tags
        const tags = Array.from(
          new Set(mockData.flatMap((item) => item.tags))
        );
        setAvailableTags(tags);
      } catch (error) {
        showToast({
          type: 'error',
          message: error instanceof Error ? error.message : 'Failed to fetch knowledge base',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchKnowledgeBase();
  }, [showToast]);
  
  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  };
  
  const handleDeleteItem = (id: string) => {
    setKnowledgeItems((prev) => prev.filter((item) => item.id !== id));
    
    showToast({
      type: 'success',
      message: 'Item removed from knowledge base',
    });
  };
  
  const handleExportItem = (id: string) => {
    showToast({
      type: 'info',
      message: 'Exporting knowledge base item...',
    });
    
    // Simulate export delay
    setTimeout(() => {
      showToast({
        type: 'success',
        message: 'Knowledge base item exported successfully',
      });
    }, 1500);
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Filter items based on search query and selected tags
  const filteredItems = knowledgeItems.filter((item) => {
    const matchesSearch =
      searchQuery === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.url.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.every((tag) => item.tags.includes(tag));
    
    return matchesSearch && matchesTags;
  });
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Knowledge Base</h1>
        <p className="mt-2 text-gray-600">
          Manage and access your crawled websites and extracted knowledge
        </p>
      </div>
      
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search knowledge base..."
            icon={<Search size={18} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'primary' : 'outline'}
            size="sm"
            icon={<Grid size={18} />}
            onClick={() => setViewMode('grid')}
          >
            Grid
          </Button>
          <Button
            variant={viewMode === 'list' ? 'primary' : 'outline'}
            size="sm"
            icon={<List size={18} />}
            onClick={() => setViewMode('list')}
          >
            List
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters sidebar */}
        <div className="lg:col-span-1">
          <Card title="Filters">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Tags</h3>
                <div className="space-y-2">
                  {availableTags.map((tag) => (
                    <div key={tag} className="flex items-center">
                      <input
                        id={`tag-${tag}`}
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        checked={selectedTags.includes(tag)}
                        onChange={() => handleTagToggle(tag)}
                      />
                      <label
                        htmlFor={`tag-${tag}`}
                        className="ml-2 block text-sm text-gray-700"
                      >
                        {tag}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {selectedTags.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => setSelectedTags([])}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </Card>
          
          <Card title="Export Options" className="mt-6">
            <div className="space-y-3">
              <Button variant="outline" size="sm" fullWidth icon={<Download size={16} />}>
                Export All as PDF
              </Button>
              <Button variant="outline" size="sm" fullWidth icon={<Download size={16} />}>
                Export All as Markdown
              </Button>
            </div>
          </Card>
        </div>
        
        {/* Knowledge base items */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <Database className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No items found</h3>
              <p className="mt-1 text-gray-500">
                Try adjusting your search or filters to find what you're looking for
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.map((item) => (
                <Card key={item.id} className="h-full hover:shadow-card-hover transition-shadow duration-300">
                  <div className="relative pb-[56.25%] mb-4 rounded-md overflow-hidden bg-gray-200">
                    {item.thumbnail && (
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.title}</h3>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <Globe size={14} className="mr-1" />
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline truncate"
                    >
                      {item.url}
                    </a>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {item.tags.map((tag) => (
                      <Badge key={tag} variant="primary" size="sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-auto pt-2 border-t border-gray-100">
                    <div className="flex items-center">
                      <Clock size={12} className="mr-1" />
                      Crawled {formatDate(item.crawledAt)}
                    </div>
                    <div>{item.pageCount} pages</div>
                  </div>
                  
                  <div className="flex justify-between mt-4 pt-3 border-t border-gray-100">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<ExternalLink size={14} />}
                      onClick={() => window.open(item.url, '_blank')}
                    >
                      Visit
                    </Button>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Download size={14} />}
                        onClick={() => handleExportItem(item.id)}
                      >
                        Export
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Trash2 size={14} />}
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredItems.map((item) => (
                <Card key={item.id} className="hover:shadow-card-hover transition-shadow duration-300">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="md:w-1/4 lg:w-1/5">
                      <div className="relative pb-[75%] md:pb-[100%] rounded-md overflow-hidden bg-gray-200">
                        {item.thumbnail && (
                          <img
                            src={item.thumbnail}
                            alt={item.title}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.title}</h3>
                      
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <Globe size={14} className="mr-1" />
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline truncate"
                        >
                          {item.url}
                        </a>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {item.tags.map((tag) => (
                          <Badge key={tag} variant="primary" size="sm">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center">
                          <Clock size={12} className="mr-1" />
                          Crawled {formatDate(item.crawledAt)}
                        </div>
                        <div>{item.pageCount} pages</div>
                      </div>
                    </div>
                    
                    <div className="flex md:flex-col justify-between gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<ExternalLink size={14} />}
                        onClick={() => window.open(item.url, '_blank')}
                      >
                        Visit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Download size={14} />}
                        onClick={() => handleExportItem(item.id)}
                      >
                        Export
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Trash2 size={14} />}
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default KnowledgeBase;