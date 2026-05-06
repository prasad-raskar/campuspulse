import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, BookOpen, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
  const { user } = useAuth();

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">My Profile</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your personal information.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-sm overflow-hidden rounded-xl border border-gray-100 dark:border-gray-700 transition-colors">
        <div className="px-4 py-5 sm:px-6 bg-blue-50 dark:bg-gray-900/50 flex items-center space-x-4 border-b border-gray-200 dark:border-gray-700">
          <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-sm">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h3 className="text-xl leading-6 font-semibold text-gray-900 dark:text-white">{user?.name || user?.email?.split('@')[0]}</h3>
            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium capitalize mt-1">{user?.role}</p>
          </div>
        </div>
        <div className="px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-100 dark:sm:divide-gray-700">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                <Mail className="h-4 w-4 mr-2" /> Email Address
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">{user?.email}</dd>
            </div>
            {user?.role === 'student' && (
              <>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                    <BookOpen className="h-4 w-4 mr-2" /> Class/Semester
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">{user?.user_class || 'N/A'}</dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                    <GraduationCap className="h-4 w-4 mr-2" /> Branch
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">{user?.branch || 'N/A'}</dd>
                </div>
              </>
            )}
          </dl>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;
