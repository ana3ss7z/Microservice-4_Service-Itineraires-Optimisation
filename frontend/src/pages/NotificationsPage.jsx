import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, CheckAll, Clock, MapPin, Route, AlertCircle, MessageCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { getUnreadNotificationCount, getUnreadNotifications, markAsRead, markAllAsRead } from '../services/api';

// This component would use WebSocket for real-time notifications
// For now, I'll implement a polling-based approach with the available API
export default function NotificationsPage() {
  const { darkMode } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'unread'
  const [selectedNotification, setSelectedNotification] = useState(null);
  const pollInterval = useRef(null);

  useEffect(() => {
    fetchNotifications();
    loadUnreadCount();
    
    // Set up polling for updates (in a real implementation, this would be WebSocket)
    pollInterval.current = setInterval(() => {
      loadUnreadCount();
    }, 30000); // Poll every 30 seconds for unread count

    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
      }
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // Since we don't have a full endpoint for all notifications yet, we'll use unread as default
      const data = await getUnreadNotifications('currentUser'); // In real app, this would use actual user ID
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      // In a real app, this would use the actual user ID
      const count = await getUnreadNotificationCount('currentUser');
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications(notifications.filter(n => n.id !== id));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead('currentUser'); // In real app, use actual user ID
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'ROUTE_STARTED':
        return <Route className="w-5 h-5 text-green-500" />;
      case 'ESTIMATED_ARRIVAL':
        return <Clock className="w-5 h-5 text-orange-500" />;
      case 'ROUTE_COMPLETED':
        return <Check className="w-5 h-5 text-blue-500" />;
      case 'ROUTE_DELAYED':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'SYSTEM_MESSAGE':
        return <MessageCircle className="w-5 h-5 text-indigo-500" />;
      case 'URGENT':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'ROUTE_STARTED':
        return 'border-l-4 border-green-500';
      case 'ESTIMATED_ARRIVAL':
        return 'border-l-4 border-orange-500';
      case 'ROUTE_COMPLETED':
        return 'border-l-4 border-blue-500';
      case 'ROUTE_DELAYED':
        return 'border-l-4 border-red-500';
      case 'URGENT':
        return 'border-l-4 border-red-600 bg-red-50 dark:bg-red-900/20';
      default:
        return 'border-l-4 border-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold flex items-center gap-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            <Bell className="w-8 h-8 text-orange-500" />
            Notifications
          </h1>
          <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Gérez vos notifications et alertes
          </p>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                darkMode 
                  ? 'bg-slate-700 hover:bg-slate-600 text-gray-200' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              } transition-colors`}
            >
              <CheckAll className="w-4 h-4" />
              Tout marquer comme lu
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`rounded-2xl p-6 ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{notifications.length}</p>
            </div>
            <Bell className="w-10 h-10 text-orange-500/20" />
          </div>
        </div>

        <div className={`rounded-2xl p-6 ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Non lues</p>
              <p className="text-2xl font-bold text-red-500">{unreadCount}</p>
            </div>
            <Bell className="w-10 h-10 text-red-500/20" />
          </div>
        </div>

        <div className={`rounded-2xl p-6 ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Aujourd'hui</p>
              <p className="text-2xl font-bold text-blue-500">{notifications.length}</p>
            </div>
            <Clock className="w-10 h-10 text-blue-500/20" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={`rounded-2xl shadow-lg overflow-hidden ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
        <div className="border-b border-gray-200 dark:border-slate-700">
          <div className="flex">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-4 px-6 text-center font-medium border-b-2 transition-colors ${
                activeTab === 'all'
                  ? darkMode
                    ? 'border-orange-500 text-orange-400 bg-slate-700/50'
                    : 'border-orange-500 text-orange-600 bg-orange-50'
                  : darkMode
                  ? 'border-transparent text-gray-400 hover:text-gray-300'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Toutes les notifications
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={`flex-1 py-4 px-6 text-center font-medium border-b-2 transition-colors ${
                activeTab === 'unread'
                  ? darkMode
                    ? 'border-orange-500 text-orange-400 bg-slate-700/50'
                    : 'border-orange-500 text-orange-600 bg-orange-50'
                  : darkMode
                  ? 'border-transparent text-gray-400 hover:text-gray-300'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Non lues ({unreadCount})
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="divide-y divide-gray-100 dark:divide-slate-700">
          {notifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
              <h4 className={`text-lg font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Aucune notification
              </h4>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                Les notifications apparaîtront ici
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-6 ${getNotificationColor(notification.type)} ${
                  darkMode ? 'bg-slate-800/80' : 'bg-white'
                } hover:${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'} transition-colors`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          {notification.title}
                        </h4>
                        <p className={`mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {notification.message}
                        </p>
                        
                        {notification.routeId && (
                          <div className={`mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                            darkMode ? 'bg-slate-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                          }`}>
                            <MapPin className="w-3 h-3" />
                            Route: {notification.routeId.substring(0, 8)}...
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-shrink-0 gap-2 ml-4">
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className={`p-2 rounded-lg ${
                            darkMode 
                              ? 'text-gray-400 hover:text-green-400 hover:bg-slate-700' 
                              : 'text-gray-500 hover:text-green-600 hover:bg-gray-100'
                          } transition-colors`}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className={`mt-3 flex items-center justify-between text-xs ${
                      darkMode ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      <span>{new Date(notification.createdAt).toLocaleString('fr-FR')}</span>
                      {!notification.read && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                          Non lu
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}