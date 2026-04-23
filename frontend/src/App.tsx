import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Analytics } from "@vercel/analytics/react";
import { AuthProvider, useAuth } from './AuthContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Upload from './components/Upload';
import ExpenseList from './components/ExpenseList';
import ReimbursementHistory from './components/ReimbursementHistory';
import Login from './pages/Login';
import Signup from './pages/Signup';
import LandingPage from './pages/LandingPage';
import About from './pages/About';
import HeroDemo from './pages/HeroDemo';
import Unauthorized from './pages/Unauthorized';
import Settings from './pages/Settings';
import { Skeleton } from './components/ui/skeleton';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { token, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
                <div className="w-full max-w-lg space-y-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="grid gap-3 pt-4 sm:grid-cols-3">
                        <Skeleton className="h-20 rounded-xl" />
                        <Skeleton className="h-20 rounded-xl" />
                        <Skeleton className="h-20 rounded-xl" />
                    </div>
                </div>
            </div>
        );
    }

    return token ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Analytics />
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/hero-demo" element={<HeroDemo />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/unauthorized" element={<Unauthorized />} />
                    <Route path="/*" element={
                        <ProtectedRoute>
                            <Layout>
                                <Routes>
                                    <Route path="/dashboard" element={<Dashboard />} />
                                    <Route path="/upload" element={<Upload />} />
                                    <Route path="/expenses" element={<ExpenseList />} />
                                    <Route path="/reimbursements" element={<ReimbursementHistory />} />
                                    <Route path="/settings" element={<Settings />} />
                                </Routes>
                            </Layout>
                        </ProtectedRoute>
                    } />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
