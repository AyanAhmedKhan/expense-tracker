import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Upload, Receipt, History, Moon, Sun, LogOut } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../AuthContext';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const { user, logout } = useAuth();
    const [darkMode, setDarkMode] = useState(() => {
        // Initialize from localStorage or default to false (light mode)
        return localStorage.getItem('darkMode') === 'true';
    });

    useEffect(() => {
        // Apply the current dark mode state to the document
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    const toggleDarkMode = () => {
        console.log('Toggle function called!');
        const newMode = !darkMode;
        console.log('Current darkMode:', darkMode, '→ New mode:', newMode);
        setDarkMode(newMode);
        localStorage.setItem('darkMode', String(newMode));

        if (newMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        console.log('Dark mode toggled:', newMode, 'HTML classes:', document.documentElement.className);
    };

    const handleLogout = () => {
        logout();
        window.location.href = '/login';
    };

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/upload', label: 'Upload', icon: Upload },
        { path: '/expenses', label: 'Expenses', icon: Receipt },
        { path: '/reimbursements', label: 'Reimbursements', icon: History },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col md:flex-row">
            {/* Mobile Dark Mode Toggle - Floating Button */}
            <button
                onClick={toggleDarkMode}
                className="md:hidden fixed top-4 right-4 z-50 p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                aria-label="Toggle dark mode"
            >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Mobile Bottom Nav */}
            <nav className="md:hidden fixed bottom-0 w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-around py-3 z-50">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={clsx(
                            'flex flex-col items-center text-xs',
                            location.pathname === item.path ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
                        )}
                    >
                        <item.icon size={20} />
                        <span className="mt-1">{item.label}</span>
                    </Link>
                ))}
            </nav>

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen sticky top-0">
                <div className="p-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">ExpensesLog</h1>
                    <button
                        onClick={toggleDarkMode}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                        aria-label="Toggle dark mode"
                        title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                        {darkMode ? (
                            <Sun size={20} className="animate-in fade-in spin-in-0" />
                        ) : (
                            <Moon size={20} className="animate-in fade-in spin-in-0" />
                        )}
                    </button>
                </div>
                <nav className="flex-1 px-4 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={clsx(
                                'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors',
                                location.pathname === item.path
                                    ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                            )}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                        <div className="text-sm">
                            <p className="font-medium text-gray-900 dark:text-white">{user?.name}</p>
                            <p className="text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    >
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 mb-16 md:mb-0 overflow-y-auto">
                <div className="max-w-4xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
