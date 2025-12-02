import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, PieChart, Zap, CheckCircle, Smartphone, Upload } from 'lucide-react';
import Logo from '../components/Logo';

const LandingPage: React.FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-900 text-white overflow-hidden font-sans">
            {/* Navigation */}
            <nav className="container mx-auto px-6 py-6 flex justify-between items-center relative z-50">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3"
                >
                    <div className="bg-indigo-500/10 p-2 rounded-xl border border-indigo-500/20 backdrop-blur-sm">
                        <Logo size={32} />
                    </div>
                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
                        ExpensesLog
                    </span>
                </motion.div>

                {/* Desktop Nav */}
                <div className="space-x-6 hidden md:flex items-center">
                    <Link to="/about" className="text-gray-300 hover:text-white transition-colors">About</Link>
                    <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
                    <a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors">How it Works</a>
                    <Link to="/login" className="text-gray-300 hover:text-white transition-colors">Login</Link>
                    <Link to="/signup" className="bg-indigo-600 hover:bg-indigo-700 px-6 py-2 rounded-full transition-all transform hover:scale-105 shadow-lg shadow-indigo-500/30">
                        Get Started
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-gray-300 hover:text-white focus:outline-none"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    )}
                </button>
            </nav>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="fixed inset-0 z-40 bg-gray-900/95 backdrop-blur-lg pt-24 px-6 md:hidden"
                >
                    <div className="flex flex-col space-y-6 text-center">
                        <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-xl text-gray-300 hover:text-white transition-colors">About</Link>
                        <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="text-xl text-gray-300 hover:text-white transition-colors">Features</a>
                        <a href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="text-xl text-gray-300 hover:text-white transition-colors">How it Works</a>
                        <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-xl text-gray-300 hover:text-white transition-colors">Login</Link>
                        <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)} className="bg-indigo-600 hover:bg-indigo-700 px-8 py-3 rounded-full text-xl font-bold transition-all shadow-lg shadow-indigo-500/30 mx-auto inline-block">
                            Get Started
                        </Link>
                    </div>
                </motion.div>
            )}

            {/* Hero Section */}
            <header className="container mx-auto px-6 py-20 md:py-32 flex flex-col md:flex-row items-center relative">
                {/* Background Blobs */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[120px] -z-10"></div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="md:w-1/2 mb-16 md:mb-0 text-center md:text-left"
                >
                    <div className="inline-block px-4 py-2 bg-indigo-900/50 rounded-full text-indigo-300 text-sm font-medium mb-6 border border-indigo-500/30">
                        🚀 The Future of Expense Management
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-8">
                        Master Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">
                            Financial Life
                        </span>
                    </h1>
                    <p className="text-xl text-gray-400 mb-10 max-w-lg mx-auto md:mx-0 leading-relaxed">
                        Effortlessly track expenses, manage reimbursements, and gain deep insights into your spending habits with our AI-powered platform.
                    </p>
                    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center md:justify-start">
                        <Link to="/signup" className="group bg-white text-gray-900 px-8 py-4 rounded-full font-bold flex items-center justify-center hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
                            Start for Free
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <a href="#features" className="px-8 py-4 rounded-full font-semibold border border-gray-700 hover:bg-gray-800 transition-colors flex items-center justify-center">
                            Learn More
                        </a>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="md:w-1/2 relative perspective-1000"
                >
                    <div className="relative z-10 rounded-2xl shadow-2xl border border-gray-700/50 overflow-hidden bg-gray-800/50 backdrop-blur-sm transform rotate-y-12 hover:rotate-y-0 transition-transform duration-700">
                        <img
                            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"
                            alt="Dashboard Preview"
                            className="w-full h-auto opacity-90"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                    </div>
                </motion.div>
            </header>

            {/* Features Grid */}
            <section id="features" className="container mx-auto px-6 py-24">
                <div className="text-center mb-20">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">Everything you need</h2>
                    <p className="text-gray-400 text-xl max-w-2xl mx-auto">
                        Powerful features to help you take control of your personal and business finances.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={<PieChart className="w-8 h-8 text-indigo-400" />}
                        title="Smart Analytics"
                        description="Visualize your spending with interactive charts. Understand where every penny goes."
                        delay={0.1}
                    />
                    <FeatureCard
                        icon={<Shield className="w-8 h-8 text-purple-400" />}
                        title="Bank Grade Security"
                        description="Your financial data is encrypted with AES-256 bit encryption. We prioritize your privacy."
                        delay={0.2}
                    />
                    <FeatureCard
                        icon={<Zap className="w-8 h-8 text-cyan-400" />}
                        title="Instant Reimbursements"
                        description="Streamline your reimbursement process. Generate reports and get paid faster."
                        delay={0.3}
                    />
                </div>
            </section>

            {/* Feature Spotlight 1 */}
            <section className="py-24 bg-gray-800/30">
                <div className="container mx-auto px-6 flex flex-col md:flex-row items-center gap-16">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="md:w-1/2"
                    >
                        <div className="w-16 h-16 bg-indigo-900/50 rounded-2xl flex items-center justify-center mb-8">
                            <Smartphone className="w-8 h-8 text-indigo-400" />
                        </div>
                        <h3 className="text-3xl md:text-4xl font-bold mb-6">Track Expenses on the Go</h3>
                        <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                            Never lose a receipt again. With our mobile-friendly PWA, you can snap photos of receipts, categorize expenses, and sync everything to the cloud instantly.
                        </p>
                        <ul className="space-y-4">
                            {['Offline support', 'Instant sync', 'Receipt scanning'].map((item, i) => (
                                <li key={i} className="flex items-center text-gray-300">
                                    <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="md:w-1/2"
                    >
                        <img
                            src="https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                            alt="Mobile App"
                            className="rounded-2xl shadow-2xl border border-gray-700"
                        />
                    </motion.div>
                </div>
            </section>

            {/* Feature Spotlight 2 */}
            <section className="py-24">
                <div className="container mx-auto px-6 flex flex-col md:flex-row-reverse items-center gap-16">
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="md:w-1/2"
                    >
                        <div className="w-16 h-16 bg-purple-900/50 rounded-2xl flex items-center justify-center mb-8">
                            <Upload className="w-8 h-8 text-purple-400" />
                        </div>
                        <h3 className="text-3xl md:text-4xl font-bold mb-6">Effortless Statement Uploads</h3>
                        <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                            Stop manual data entry. Upload your ICICI bank statements directly, and our intelligent parser will automatically extract and categorize transactions for you.
                        </p>
                        <ul className="space-y-4">
                            {['PDF parsing', 'Auto-categorization', 'Duplicate detection'].map((item, i) => (
                                <li key={i} className="flex items-center text-gray-300">
                                    <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="md:w-1/2"
                    >
                        <img
                            src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                            alt="Data Analysis"
                            className="rounded-2xl shadow-2xl border border-gray-700"
                        />
                    </motion.div>
                </div>
            </section>

            {/* How it Works */}
            <section id="how-it-works" className="py-24 bg-gray-800/30">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl md:text-5xl font-bold mb-16">How it Works</h2>
                    <div className="grid md:grid-cols-3 gap-12">
                        {[
                            { step: '01', title: 'Sign Up', desc: 'Create your free account in seconds using Google or Email.' },
                            { step: '02', title: 'Add Expenses', desc: 'Upload statements or add expenses manually on the go.' },
                            { step: '03', title: 'Get Insights', desc: 'View detailed reports and track your financial health.' }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.2 }}
                                className="relative"
                            >
                                <div className="text-8xl font-bold text-gray-800 absolute -top-10 left-1/2 -translate-x-1/2 -z-10">
                                    {item.step}
                                </div>
                                <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                                <p className="text-gray-400">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-indigo-600/10"></div>
                <div className="container mx-auto px-6 text-center relative z-10">
                    <h2 className="text-4xl md:text-6xl font-bold mb-8">Ready to take control?</h2>
                    <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
                        Join thousands of users who are mastering their finances with ExpensesLog. Start your free trial today.
                    </p>
                    <Link to="/signup" className="inline-flex items-center bg-white text-gray-900 px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
                        Get Started Now
                        <ArrowRight className="ml-2 w-6 h-6" />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 border-t border-gray-800 py-12">
                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-6 md:mb-0">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-indigo-500/10 p-2 rounded-xl border border-indigo-500/20">
                                <Logo size={24} />
                            </div>
                            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
                                ExpensesLog
                            </span>
                        </div>
                        <p className="text-gray-500 mt-2">© {new Date().getFullYear()} ExpensesLog. All rights reserved.</p>
                        <p className="text-gray-600 text-sm mt-1">Developed by <a href="https://linkedin.com/in/ayan-ahmed-khan" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 transition-colors">Ayan Ahmed Khan</a></p>
                    </div>
                    <div className="flex space-x-8">
                        <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay }}
        className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700 hover:border-indigo-500/50 hover:bg-gray-800 transition-all group"
    >
        <div className="bg-gray-700/50 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-4">{title}</h3>
        <p className="text-gray-400 leading-relaxed">{description}</p>
    </motion.div>
);

export default LandingPage;
