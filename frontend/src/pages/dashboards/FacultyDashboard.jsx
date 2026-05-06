import React, { useState, useEffect } from 'react';
import { Bell, FileText, BarChart, Calendar, Tag, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SkeletonDashboardStats } from '../../components/Skeleton';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { API_URL } from '../../config';


const FacultyDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState(null);
  const [myNotices, setMyNotices] = useState([]);
  const { token, user } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch stats
        const statsRes = await fetch(`${API_URL}/dashboard/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (statsRes.ok) {
          const statsJson = await statsRes.json();
          setStatsData(statsJson);
        }

        // Fetch notices
        const noticesRes = await fetch(`${API_URL}/notices/my`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (noticesRes.ok) {
          const noticesJson = await noticesRes.json();
          // Filter to only show notices created by this specific faculty
          const filteredNotices = noticesJson.filter(n => n.created_by == user?.id);
          setMyNotices(filteredNotices);
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (token && user?.id) fetchDashboardData();
  }, [token, user?.id]);

  const stats = [
    { name: 'My Published Notices', stat: statsData?.notices_created || '0', icon: Bell, color: 'bg-blue-500 text-white' },
    { name: 'Total College Notices', stat: statsData?.total_notices || '0', icon: FileText, color: 'bg-indigo-500 text-white' },
    { name: 'Average Engagement', stat: statsData?.engagement_rate || '0%', icon: BarChart, color: 'bg-purple-500 text-white' },
  ];

  const handleDelete = async (noticeId) => {
    if (!window.confirm("Are you sure you want to delete this notice?")) return;
    try {
      const response = await fetch(`${API_URL}/notices/${noticeId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setMyNotices(myNotices.filter(n => n.id !== noticeId));
        toast.success("Notice deleted successfully");
        setStatsData(prev => ({...prev, notices_created: Math.max(0, prev.notices_created - 1)}));
      } else {
        const err = await response.json();
        toast.error(err.detail || "Failed to delete notice");
      }
    } catch (e) {
      toast.error("Error deleting notice");
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Faculty Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Create notices and manage your classes.</p>
        </div>
        <Link to="/create-notice" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition shadow-sm whitespace-nowrap">
          + New Notice
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <>
            <SkeletonDashboardStats />
            <SkeletonDashboardStats />
            <SkeletonDashboardStats />
          </>
        ) : stats.map((item, i) => (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={item.name} className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-xl p-5 border border-gray-100 dark:border-gray-700 flex items-center transition-colors">
            <div className={`p-3 rounded-lg ${item.color}`}>
              <item.icon className="h-6 w-6" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{item.name}</dt>
                <dd className="text-2xl font-semibold text-gray-900 dark:text-white">{item.stat}</dd>
              </dl>
            </div>
          </motion.div>
        ))}
      </div>
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-100 dark:border-gray-700 p-6 transition-colors">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">My Recent Notices</h2>
          <Link to="/notices" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500">View All Feeds &rarr;</Link>
        </div>
        
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          </div>
        ) : myNotices.length === 0 ? (
          <div className="py-10 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400 mb-2">You haven't published any notices yet.</p>
            <Link to="/create-notice" className="text-blue-600 font-medium hover:underline">Create your first notice</Link>
          </div>
        ) : (
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {myNotices.map(notice => (
              <div key={notice.id} className="flex justify-between items-start p-4 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                      {notice.notice_type}
                    </span>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{notice.title}</h3>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center">
                    <Calendar className="w-3 h-3 mr-1" /> {new Date(notice.created_at).toLocaleDateString()}
                    {notice.target_class && <span className="ml-3">&bull; {notice.target_class}</span>}
                    {notice.target_branch && <span className="ml-2">&bull; {notice.target_branch}</span>}
                  </p>
                </div>
                <button 
                  onClick={() => handleDelete(notice.id)}
                  className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  title="Delete Notice"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default FacultyDashboard;
