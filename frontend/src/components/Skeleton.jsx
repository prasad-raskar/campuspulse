import React from 'react';

export const SkeletonCard = () => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 animate-pulse">
    <div className="flex justify-between items-start">
      <div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mt-2"></div>
      </div>
    </div>
    <div className="mt-3 space-y-2">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
    </div>
    <div className="mt-4 flex items-center space-x-4">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
    </div>
  </div>
);

export const SkeletonDashboardStats = () => (
  <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-xl p-5 border border-gray-100 dark:border-gray-700 animate-pulse flex items-center">
    <div className="p-3 rounded-lg bg-gray-200 dark:bg-gray-700 h-12 w-12"></div>
    <div className="ml-5 w-0 flex-1">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
    </div>
  </div>
);
