import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Send, Globe, User, Bot, Search } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import { useToast } from '../components/common/ToastContainer';
import { crawlWebsite, queryContent } from '../services/crawlerService';

interface ChatFormData {
  query: string;
}

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isLoading?: boolean;
}

const WebChat = () => {
  const [url, setUrl] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCrawling, setIsCrawling] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChatFormData>({
    defaultValues: {
      query: '',
    },
  });
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleCrawl = async () => {
    if (!url) {
      showToast({
        type: 'warning',
        message: 'Please enter a URL first',
      });
      return;
    }
    
    setIsCrawling(true);
    try {
      await crawlWebsite(url);
      showToast({
        type: 'success',
        message: 'Website crawled successfully! You can now ask questions about its content.',
      });
    } catch (error) {
      showToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to crawl website',
      });
    } finally {
      setIsCrawling(false);
    }
  };
  
  const onSubmit = async (data: ChatFormData) => {
    if (!url) {
      showToast({
        type: 'warning',
        message: 'Please enter a URL first',
      });
      return;
    }
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: data.query,
      sender: 'user',
      timestamp: new Date(),
    };
    
    // Add loading bot message
    const loadingBotMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: '',
      sender: 'bot',
      timestamp: new Date(),
      isLoading: true,
    };
    
    setMessages(prev => [...prev, userMessage, loadingBotMessage]);
    reset();
    
    try {
      setIsLoading(true);
      const result = await queryContent(url, data.query);
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === loadingBotMessage.id
            ? {
                ...msg,
                content: result.response,
                isLoading: false,
              }
            : msg
        )
      );
    } catch (error) {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === loadingBotMessage.id
            ? {
                ...msg,
                content: `Error: ${error instanceof Error ? error.message : 'Failed to get response'}`,
                isLoading: false,
              }
            : msg
        )
      );
      
      showToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to get response',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* URL and Crawl section */}
      <div className="bg-white border-b border-gray-200 p-4">
        <Card>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Enter website URL..."
                icon={<Globe size={18} />}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <Button
              variant="primary"
              icon={<Search size={18} />}
              isLoading={isCrawling}
              onClick={handleCrawl}
            >
              Crawl Website
            </Button>
          </div>
        </Card>
      </div>
      
      {/* Chat area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Bot className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                Start a conversation
              </h3>
              <p className="mt-1 text-gray-500">
                Enter a URL above, crawl the website, and ask questions about its content
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.sender === 'user'
                    ? 'bg-primary text-white'
                    : 'bg-white border border-gray-200 text-gray-800'
                }`}
              >
                <div className="flex items-center mb-1">
                  {message.sender === 'user' ? (
                    <User size={16} className="mr-1" />
                  ) : (
                    <Bot size={16} className="mr-1" />
                  )}
                  <span className="text-xs opacity-70">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
                
                {message.isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '600ms' }}></div>
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none">
                    {message.sender === 'bot' ? (
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    ) : (
                      <p>{message.content}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit(onSubmit)} className="flex space-x-2">
          <div className="flex-1">
            <Input
              placeholder="Type your question..."
              error={errors.query?.message}
              className="m-0"
              {...register('query', {
                required: 'Please enter a question',
              })}
            />
          </div>
          <Button
            type="submit"
            isLoading={isLoading}
            icon={<Send size={18} />}
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  );
};

export default WebChat;