import React, { useEffect, useState } from 'react';
import { getMe, updateProfile, changePassword, getCategories, createCategory, deleteCategory, Category, UserProfile } from '../api/endpoints';
import { User, Lock, Tag, Plus, Trash2, Palette, Sun, Moon } from 'lucide-react';

const PRESET_COLORS = [
    '#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6',
    '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#6b7280',
];

const Settings: React.FC = () => {
    // Profile
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [editName, setEditName] = useState('');
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileMsg, setProfileMsg] = useState('');

    // Password
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordMsg, setPasswordMsg] = useState('');

    // Categories
    const [categories, setCategories] = useState<Category[]>([]);
    const [newCatName, setNewCatName] = useState('');
    const [newCatColor, setNewCatColor] = useState('#6366f1');
    const [catLoading, setCatLoading] = useState(false);
    const [catMsg, setCatMsg] = useState('');

    // Dark mode
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

    useEffect(() => {
        fetchProfile();
        fetchCategories();
    }, []);

    const fetchProfile = async () => {
        try {
            const data = await getMe();
            setProfile(data);
            setEditName(data.name);
        } catch {
            console.error('Failed to fetch profile');
        }
    };

    const fetchCategories = async () => {
        try {
            const data = await getCategories();
            setCategories(data);
        } catch {
            console.error('Failed to fetch categories');
        }
    };

    // ── Profile ──
    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileLoading(true);
        setProfileMsg('');
        try {
            const updated = await updateProfile({ name: editName });
            setProfile(updated);
            setProfileMsg('Profile updated successfully!');
            setTimeout(() => setProfileMsg(''), 3000);
        } catch (error) {
            setProfileMsg('Failed to update profile');
        } finally {
            setProfileLoading(false);
        }
    };

    // ── Password ──
    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setPasswordMsg('Passwords do not match');
            return;
        }
        if (newPassword.length < 6) {
            setPasswordMsg('Password must be at least 6 characters');
            return;
        }
        setPasswordLoading(true);
        setPasswordMsg('');
        try {
            await changePassword({ old_password: oldPassword, new_password: newPassword });
            setPasswordMsg('Password changed successfully!');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => setPasswordMsg(''), 3000);
        } catch (error: any) {
            const detail = error?.response?.data?.detail || 'Failed to change password';
            setPasswordMsg(detail);
        } finally {
            setPasswordLoading(false);
        }
    };

    // ── Categories ──
    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCatName.trim()) return;
        setCatLoading(true);
        setCatMsg('');
        try {
            await createCategory({ name: newCatName.trim(), color: newCatColor });
            setNewCatName('');
            setNewCatColor('#6366f1');
            fetchCategories();
            setCatMsg('Category added!');
            setTimeout(() => setCatMsg(''), 3000);
        } catch (error: any) {
            setCatMsg(error?.response?.data?.detail || 'Failed to add category');
        } finally {
            setCatLoading(false);
        }
    };

    const handleDeleteCategory = async (id: number) => {
        if (!confirm('Delete this category? Expenses with this category will be uncategorized.')) return;
        try {
            await deleteCategory(id);
            fetchCategories();
        } catch {
            alert('Failed to delete category');
        }
    };

    // ── Dark Mode ──
    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        localStorage.setItem('darkMode', String(newMode));
        if (newMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const isGoogleUser = profile?.google_id != null;

    return (
        <div className="space-y-8 max-w-2xl">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Settings</h2>

            {/* ── Appearance ── */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                    {darkMode ? <Moon size={20} /> : <Sun size={20} />}
                    Appearance
                </h3>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-gray-700 dark:text-gray-300">Dark Mode</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Switch between light and dark theme</p>
                    </div>
                    <button
                        onClick={toggleDarkMode}
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${darkMode ? 'bg-blue-600' : 'bg-gray-300'}`}
                    >
                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
            </div>

            {/* ── Profile ── */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                    <User size={20} />
                    Profile
                </h3>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Name</label>
                        <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Email</label>
                        <input type="email" value={profile?.email || ''} disabled
                            className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-lg px-3 py-2 text-sm cursor-not-allowed" />
                    </div>
                    {isGoogleUser && (
                        <p className="text-xs text-blue-500 dark:text-blue-400 flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                            Signed in with Google
                        </p>
                    )}
                    <div className="flex items-center gap-3">
                        <button type="submit" disabled={profileLoading}
                            className="bg-blue-600 dark:bg-blue-500 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50">
                            {profileLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                        {profileMsg && <span className={`text-sm ${profileMsg.includes('success') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{profileMsg}</span>}
                    </div>
                </form>
            </div>

            {/* ── Password ── */}
            {!isGoogleUser && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                        <Lock size={20} />
                        Change Password
                    </h3>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Current Password</label>
                            <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required
                                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">New Password</label>
                            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6}
                                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Confirm New Password</label>
                            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6}
                                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" />
                        </div>
                        <div className="flex items-center gap-3">
                            <button type="submit" disabled={passwordLoading}
                                className="bg-blue-600 dark:bg-blue-500 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50">
                                {passwordLoading ? 'Changing...' : 'Change Password'}
                            </button>
                            {passwordMsg && <span className={`text-sm ${passwordMsg.includes('success') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{passwordMsg}</span>}
                        </div>
                    </form>
                </div>
            )}

            {/* ── Categories ── */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                    <Tag size={20} />
                    Expense Categories
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Manage categories to organize your expenses. Default categories are auto-created on first use.</p>

                {/* Existing Categories */}
                <div className="space-y-2 mb-6">
                    {categories.map((cat) => (
                        <div key={cat.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                                <span className="font-medium text-gray-800 dark:text-gray-200 text-sm">{cat.name}</span>
                            </div>
                            <button onClick={() => handleDeleteCategory(cat.id)}
                                className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors" title="Delete">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                    {categories.length === 0 && <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">No categories yet. They'll be auto-created when you first view expenses.</p>}
                </div>

                {/* Add New Category */}
                <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-3">
                    <input type="text" placeholder="Category name..." value={newCatName} onChange={(e) => setNewCatName(e.target.value)} required
                        className="flex-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" />
                    <div className="flex items-center gap-2">
                        <Palette size={16} className="text-gray-400" />
                        <div className="flex gap-1">
                            {PRESET_COLORS.map((color) => (
                                <button key={color} type="button" onClick={() => setNewCatColor(color)}
                                    className={`w-6 h-6 rounded-full transition-all ${newCatColor === color ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-gray-800 scale-110' : 'hover:scale-110'}`}
                                    style={{ backgroundColor: color }} />
                            ))}
                        </div>
                    </div>
                    <button type="submit" disabled={catLoading}
                        className="flex items-center justify-center gap-1.5 bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 whitespace-nowrap">
                        <Plus size={16} />
                        {catLoading ? 'Adding...' : 'Add'}
                    </button>
                </form>
                {catMsg && <p className={`text-sm mt-2 ${catMsg.includes('added') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{catMsg}</p>}
            </div>
        </div>
    );
};

export default Settings;
