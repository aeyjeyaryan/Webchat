import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Avatar from '../common/Avatar';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-10">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-gray-900">WebChat</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <Avatar 
                initials={user?.email.charAt(0).toUpperCase()} 
                size="sm" 
                status="online" 
              />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                  {user?.email}
                </p>
                <p className="text-xs text-gray-500">Online</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 overflow-auto pt-16">
        <div className="h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;