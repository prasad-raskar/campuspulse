import React, { useState, useEffect } from 'react';
import { Bell, BookOpen, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SkeletonDashboardStats } from '../../components/Skeleton';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config';


const StudentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState(null);
  const [recentNotices, setRecentNotices] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await fetch(`${API_URL}/dashboard/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (statsRes.ok) setStatsData(await statsRes.json());

        const noticesRes = await fetch(`${API_URL}/notices/my`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (noticesRes.ok) {
          const notices = await noticesRes.json();
          setRecentNotices(notices.slice(0, 3)); // Only show top 3
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchData();
  }, [token]);

  const stats = [
    { name: 'Unread Notices', stat: statsData?.unread_notices || '0', icon: Bell, color: 'bg-red-500 text-white' },
    { name: 'Total Notices', stat: statsData?.total_notices || '0', icon: BookOpen, color: 'bg-blue-500 text-white' },
    { name: 'Attendance', stat: statsData?.attendance || 'N/A', icon: Clock, color: 'bg-green-500 text-white' },
  ];

  const getTypeColor = (type) => {
    switch(type) {
      case 'exam': return 'border-red-500 bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-300';
      case 'event': return 'border-purple-500 bg-purple-50 dark:bg-purple-900/10 text-purple-700 dark:text-purple-300';
      case 'urgent': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10 text-yellow-700 dark:text-yellow-300';
      case 'holiday': return 'border-teal-500 bg-teal-50 dark:bg-teal-900/10 text-teal-700 dark:text-teal-300';
      default: return 'border-blue-500 bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-300';
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Student Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Check your notices and schedule.</p>
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
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recent Notices</h2>
          <Link to="/notices" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">View All</Link>
        </div>
        <div className="space-y-4">
          {recentNotices.length === 0 && !loading && (
            <p className="text-sm text-gray-500">No recent notices available.</p>
          )}
          {recentNotices.map(notice => (
            <div key={notice.id} className={`border-l-4 pl-4 py-2 rounded-r-lg ${getTypeColor(notice.notice_type)}`}>
              <p className="text-sm font-medium">{notice.title}</p>
              <p className="text-xs opacity-75 mt-1">{new Date(notice.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default StudentDashboard;
