import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Github, Linkedin, Mail, Code, Server, Database } from 'lucide-react';

const About: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans">
            {/* Navigation */}
            <nav className="container mx-auto px-6 py-6 flex justify-between items-center">
                <Link to="/" className="flex items-center text-gray-300 hover:text-white transition-colors">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Home
                </Link>
                <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
                    ExpensesLog
                </div>
            </nav>

            <div className="container mx-auto px-6 py-12">
                {/* About The Project */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-24 text-center max-w-4xl mx-auto"
                >
                    <h1 className="text-4xl md:text-6xl font-bold mb-8">About ExpensesLog</h1>
                    <p className="text-xl text-gray-400 leading-relaxed mb-12">
                        ExpensesLog is a comprehensive financial management tool designed to simplify how you track expenses and manage reimbursements.
                        Born from the need for a smarter, more intuitive way to handle personal and business finances, ExpensesLog leverages modern web technologies
                        to provide a seamless, secure, and insightful experience.
                    </p>

                    <div className="grid md:grid-cols-3 gap-8 text-left">
                        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                            <div className="bg-indigo-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                                <Code className="w-6 h-6 text-indigo-400" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">Modern Tech Stack</h3>
                            <p className="text-gray-400 text-sm">Built with React, TypeScript, Vite, and Tailwind CSS for a lightning-fast frontend.</p>
                        </div>
                        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                            <div className="bg-purple-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                                <Server className="w-6 h-6 text-purple-400" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">Robust Backend</h3>
                            <p className="text-gray-400 text-sm">Powered by Python FastAPI for high-performance API handling and data processing.</p>
                        </div>
                        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                            <div className="bg-cyan-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                                <Database className="w-6 h-6 text-cyan-400" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">Secure Data</h3>
                            <p className="text-gray-400 text-sm">Enterprise-grade security with encrypted data storage and secure authentication.</p>
                        </div>
                    </div>
                </motion.section>

                {/* About The Developer */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="max-w-5xl mx-auto bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl overflow-hidden border border-gray-700 shadow-2xl"
                >
                    <div className="flex flex-col md:flex-row">
                        <div className="md:w-2/5 bg-indigo-900/20 relative min-h-[300px] md:min-h-0">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <img
                                    src="/profilephoto.png"
                                    alt="Ayan Ahmed Khan"
                                    className="w-48 h-48 rounded-full object-cover border-4 border-indigo-500 shadow-lg"
                                />
                            </div>
                        </div>
                        <div className="md:w-3/5 p-10 md:p-16">
                            <div className="inline-block px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-sm font-medium mb-6">
                                Lead Developer
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ayan Ahmed Khan</h2>
                            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                                I'm a passionate Full Stack Developer dedicated to building intuitive and powerful web applications.
                                With a focus on user experience and clean code, I created ExpensesLog to solve real-world financial tracking problems.
                            </p>

                            <div className="flex space-x-6">
                                <a href="https://github.com/AyanAhmedKhan" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors hover:scale-110 transform duration-200">
                                    <Github className="w-6 h-6" />
                                </a>
                                <a href="https://linkedin.com/in/ayan-ahmed-khan" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors hover:scale-110 transform duration-200">
                                    <Linkedin className="w-6 h-6" />
                                </a>
                                <a href="mailto:ayan.ahmedkhan591@gmail.com" className="text-gray-400 hover:text-white transition-colors hover:scale-110 transform duration-200">
                                    <Mail className="w-6 h-6" />
                                </a>
                            </div>
                        </div>
                    </div>
                </motion.section>
            </div>

            {/* Footer */}
            <footer className="container mx-auto px-6 py-12 text-center text-gray-500 text-sm">
                <p>© {new Date().getFullYear()} ExpensesLog. Developed with ❤️ by <a href="https://linkedin.com/in/ayan-ahmed-khan" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 transition-colors">Ayan Ahmed Khan</a>.</p>
            </footer>
        </div>
    );
};

export default About;
