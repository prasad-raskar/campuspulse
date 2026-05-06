import React, { useState, useEffect } from 'react';
import { Users, Bell, BarChart, PlusCircle, UserPlus, Settings, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SkeletonDashboardStats } from '../../components/Skeleton';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config';


const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_URL}/dashboard/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setStatsData(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchStats();
  }, [token]);

  const stats = [
    { name: 'Total Users', stat: statsData?.total_users || '0', icon: Users, color: 'bg-blue-500 text-white' },
    { name: 'Total Notices', stat: statsData?.total_notices || '0', icon: Bell, color: 'bg-green-500 text-white' },
    { name: 'Engagement Rate', stat: statsData?.engagement_rate || '0%', icon: BarChart, color: 'bg-purple-500 text-white' },
  ];

  const navigate = useNavigate();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Admin Overview</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage users, view all notices, and college analytics.</p>
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
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <button onClick={() => navigate('/create-notice')} className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-blue-200 dark:border-blue-900/50 rounded-xl hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group">
            <PlusCircle className="h-8 w-8 text-blue-500 mb-3 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">Create Notice</span>
            <span className="text-xs text-gray-500 mt-1">Publish to students</span>
          </button>

          <button onClick={() => navigate('/notices')} className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-green-200 dark:border-green-900/50 rounded-xl hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all group">
            <FileText className="h-8 w-8 text-green-500 mb-3 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">View All Notices</span>
            <span className="text-xs text-gray-500 mt-1">Check past posts</span>
          </button>

          <button onClick={() => navigate('/manage-users')} className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-purple-200 dark:border-purple-900/50 rounded-xl hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all group">
            <Users className="h-8 w-8 text-purple-500 mb-3 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">Manage Students</span>
            <span className="text-xs text-gray-500 mt-1">View directory</span>
          </button>

          <button onClick={() => navigate('/register')} className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-orange-200 dark:border-orange-900/50 rounded-xl hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all group">
            <UserPlus className="h-8 w-8 text-orange-500 mb-3 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">Add Faculty</span>
            <span className="text-xs text-gray-500 mt-1">Invite staff members</span>
          </button>

        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdminDashboard;
