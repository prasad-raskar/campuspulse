import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, BookOpen, Users, Clock } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  const stats = user?.role === 'student' ? [
    { name: 'Unread Notices', stat: '3', icon: Bell, color: 'bg-red-500' },
    { name: 'Classes Today', stat: '4', icon: BookOpen, color: 'bg-blue-500' },
    { name: 'Attendance', stat: '85%', icon: Clock, color: 'bg-green-500' },
  ] : [
    { name: 'Notices Posted', stat: '12', icon: Bell, color: 'bg-blue-500' },
    { name: 'Total Students', stat: '240', icon: Users, color: 'bg-green-500' },
    { name: 'Pending Approvals', stat: '2', icon: Clock, color: 'bg-yellow-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Welcome back, {user?.name} 👋</h1>
        <p className="text-gray-500 mt-1">Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((item) => (
          <div key={item.name} className="bg-white overflow-hidden shadow-sm rounded-xl p-5 border border-gray-100 flex items-center">
            <div className={`p-3 rounded-lg ${item.color} text-white`}>
              <item.icon className="h-6 w-6" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">{item.name}</dt>
                <dd className="text-2xl font-semibold text-gray-900">{item.stat}</dd>
              </dl>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4 py-2">
            <p className="text-sm font-medium text-gray-900">New Exam Schedule Posted</p>
            <p className="text-xs text-gray-500">2 hours ago by Admin</p>
          </div>
          <div className="border-l-4 border-green-500 pl-4 py-2">
            <p className="text-sm font-medium text-gray-900">Holiday Announcement</p>
            <p className="text-xs text-gray-500">Yesterday by Principal</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
