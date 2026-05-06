import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Bell, PlusCircle, User, LogOut, Menu, X, Moon, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Layout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  let dashboardHref = '/student';
  if (user?.role === 'admin') dashboardHref = '/admin';
  if (user?.role === 'faculty') dashboardHref = '/faculty';

  const navigation = [
    { name: 'Dashboard', href: dashboardHref, icon: LayoutDashboard },
    { name: 'Notices Feed', href: '/notices', icon: Bell },
    ...(user?.role !== 'student' ? [{ name: 'Create Notice', href: '/create-notice', icon: PlusCircle }] : []),
    { name: 'My Profile', href: '/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 flex">
      {/* Sidebar - Desktop */}
      <div className="hidden md:flex w-64 flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-colors">
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700">
          <span className="text-xl font-bold text-blue-600 dark:text-blue-400">CampusPulse</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link key={item.name} to={item.href} className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-700 dark:bg-gray-700 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'}`}>
                <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-blue-700 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <button onClick={toggleTheme} className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            {theme === 'light' ? <Moon className="mr-3 h-5 w-5 text-gray-400" /> : <Sun className="mr-3 h-5 w-5 text-gray-400" />}
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>
          <button onClick={logout} className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors">
            <LogOut className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500" /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between h-16 px-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors">
          <span className="text-xl font-bold text-blue-600 dark:text-blue-400">CampusPulse</span>
          <div className="flex items-center">
            <button onClick={toggleTheme} className="p-2 text-gray-600 dark:text-gray-300 mr-2">
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600 dark:text-gray-300">
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </header>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 pt-2 pb-4 space-y-1">
            {navigation.map((item) => (
              <Link key={item.name} to={item.href} onClick={() => setIsMobileMenuOpen(false)} className={`block px-3 py-2 rounded-md text-base font-medium ${location.pathname === item.href ? 'text-blue-700 bg-blue-50 dark:bg-gray-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                {item.name}
              </Link>
            ))}
            <button onClick={logout} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">Logout</button>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
