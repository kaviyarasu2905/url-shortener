import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import PublicStats from './pages/PublicStats';
import Home from './pages/Home';

function App() {
  const { isAuthenticated, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4F46E5]"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Completely public route bypasses authentication and layout wrappers */}
      <Route path="/stats/:shortCode" element={<PublicStats />} />
      
      {/* Auth-dependent routing */}
      <Route
        path="*"
        element={
          !isAuthenticated ? (
            <div className="min-h-screen bg-[#F5F5F5]">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </div>
          ) : (
            <div className="min-h-screen bg-[#F5F5F5] flex text-[#333333] relative">
              {/* Sidebar Navigation */}
              <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
              
              {/* Main Container */}
              <div className="flex-1 flex flex-col min-w-0 md:pl-[220px] transition-all duration-300">
                
                {/* Top Navigation Bar */}
                <Navbar 
                  searchQuery={searchQuery} 
                  setSearchQuery={setSearchQuery} 
                  toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
                />
                
                {/* Main Content Area */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-in fade-in duration-150">
                  <Routes>
                    {/* Base redirect logic */}
                    <Route
                      path="/"
                      element={<Navigate to="/home" replace />}
                    />
                    
                    {/* Protected home route */}
                    <Route
                      path="/home"
                      element={
                        <ProtectedRoute>
                          <Home />
                        </ProtectedRoute>
                      }
                    />
                    
                    {/* Protected dashboard route */}
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <Dashboard searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
                        </ProtectedRoute>
                      }
                    />
                    
                    {/* Protected URL statistics page */}
                    <Route
                      path="/analytics/:id"
                      element={
                        <ProtectedRoute>
                          <Analytics />
                        </ProtectedRoute>
                      }
                    />
                    
                    {/* Fallback redirect wildcard */}
                    <Route path="*" element={<Navigate to="/home" replace />} />
                  </Routes>
                </main>
              </div>
            </div>
          )
        }
      />
    </Routes>
  );
}

export default App;
