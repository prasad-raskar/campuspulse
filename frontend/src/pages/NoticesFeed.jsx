import React, { useState, useEffect } from 'react';
import { Calendar, Tag, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { SkeletonCard } from '../components/Skeleton';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { API_URL, getMediaUrl } from '../config';


const NoticesFeed = () => {
  const { token, user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const url = user?.role === 'admin' ? `${API_URL}/notices/all` : `${API_URL}/notices/my`;
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setNotices(data);
        }
        // Silently mark all notifications as read since the user is viewing the feed
        fetch(`${API_URL}/notices/mark-read`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }).catch(e => console.error('Failed to mark as read', e));

      } catch (error) {
        console.error('Failed to fetch notices:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotices();
  }, [token, user?.role]);

  const handleDelete = async (noticeId) => {
    if (!window.confirm("Are you sure you want to delete this notice?")) return;
    try {
      const response = await fetch(`${API_URL}/notices/${noticeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        setNotices(notices.filter(n => n.id !== noticeId));
        toast.success("Notice deleted successfully");
      } else {
        const err = await response.json();
        toast.error(err.detail || "Failed to delete notice");
      }
    } catch (e) {
      toast.error("Error deleting notice");
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'exam': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'event': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'urgent': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'holiday': return 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300';
      case 'assignment': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemAnim = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Notices Feed</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Stay updated with the latest college announcements.</p>
        </div>
      </motion.div>

      <div className="space-y-4">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : notices.length === 0 ? (
          <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">No notices found.</p>
          </div>
        ) : (
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
            {notices.map((notice) => (
              <motion.div variants={itemAnim} key={notice.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase ${getTypeColor(notice.notice_type)}`}>
                      {notice.notice_type}
                    </span>
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white mt-2">{notice.title}</h2>
                  </div>
                  
                  {(user?.role === 'admin' || user?.role === 'faculty') && (
                    <button 
                      onClick={() => handleDelete(notice.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                      title="Delete Notice"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
                
                {notice.image_url && (
                  <div className="mt-4 mb-2">
                    <a href={getMediaUrl(notice.image_url)} target="_blank" rel="noopener noreferrer">
                      <img src={getMediaUrl(notice.image_url)} alt={notice.title} className="max-h-80 w-auto object-cover rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-90 transition-opacity" />
                    </a>
                  </div>
                )}

                {notice.pdf_url && (
                  <div className="mt-4 mb-2">
                    <a href={getMediaUrl(notice.pdf_url)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                      <Tag className="mr-2 -ml-1 h-4 w-4 text-gray-500 dark:text-gray-400" />
                      View Assignment Document (PDF)
                    </a>
                  </div>
                )}

                <p className="mt-3 text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {notice.description}
                </p>
                <div className="mt-4 flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <Calendar className="mr-1 h-4 w-4" />
                    {new Date(notice.created_at).toLocaleDateString()}
                  </div>
                  {notice.target_class && (
                    <div className="flex items-center bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      Class: {notice.target_class}
                    </div>
                  )}
                  {notice.target_branch && (
                    <div className="flex items-center bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      Branch: {notice.target_branch}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default NoticesFeed;
