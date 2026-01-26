// src/components/Footer.jsx

import React from 'react';
import { Phone, FlaskConical, ShieldCheck, Lock, Globe } from 'lucide-react'; // นำเข้าไอคอน Lucide
import { Link } from 'react-router-dom'; // ใช้ Link เพื่อให้เป็น SPA

const Footer = () => {
    return (
        // Footer ใช้ Dark Mode Minimalist Look
        <footer className="bg-gray-800 text-white mt-16 print:hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-10 text-sm">
                    
                    {/* 1. Brand Info & Security */}
                    <div className="col-span-2 space-y-4">
                        <Link to="/" className="flex items-center space-x-2 text-white text-xl font-bold mb-4">
                            <FlaskConical size={24} className="text-sky-400" />
                            <span>AI-Implant ID</span>
                        </Link>
                        <p className="text-gray-400">
                            Revolutionizing dental implant identification with accurate, AI-powered analysis.
                        </p>
                        
                        {/* Security Badges */}
                         <div className="pt-4 space-y-2">
                            <h5 className="font-semibold text-gray-200">Compliance & Security</h5>
                            <ul className="text-gray-400 space-y-1">
                                <li className="flex items-center">
                                    <ShieldCheck size={16} className="mr-2 text-green-400" /> End-to-End Encryption
                                </li>
                                <li className="flex items-center">
                                    <Lock size={16} className="mr-2 text-yellow-400" /> HIPAA Compliant (Mock)
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* 2. Quick Links */}
                    <div>
                        <h5 className="font-bold text-gray-200 mb-4">Quick Links</h5>
                        <ul className="space-y-3">
                            <li><Link to="/" className="text-gray-400 hover:text-sky-400 transition-colors">Overview</Link></li>
                            <li><Link to="/result" className="text-gray-400 hover:text-sky-400 transition-colors">Analysis</Link></li>
                            <li><Link to="/about" className="text-gray-400 hover:text-sky-400 transition-colors">About</Link></li>
                            <li><Link to="/contact" className="text-gray-400 hover:text-sky-400 transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    {/* 3. Resources/Tools */}
                    <div>
                        <h5 className="font-bold text-gray-200 mb-4">Resources</h5>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-gray-400 hover:text-sky-400 transition-colors">API Documentation</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-sky-400 transition-colors">Brand Finder</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-sky-400 transition-colors">Support Center</a></li>
                        </ul>
                    </div>

                    {/* 4. Contact Us */}
                    <div>
                        <h5 className="font-bold text-gray-200 mb-4">Contact</h5>
                        <div className="text-gray-400 space-y-2">
                            <p className="font-medium">Faculty of Dentistry</p>
                            <p>Mae Fah Luang University</p>
                            <p className="flex items-center mt-3">
                                <Phone size={16} className="text-sky-400 mr-2" />
                                <span className="hover:text-sky-400 transition-colors">+66 43 202 871</span>
                            </p>
                        </div>
                    </div>
                </div>

                <hr className="my-10 border-gray-700" />

                {/* Copyright & Legal Links */}
                <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 space-y-4 md:space-y-0">
                    
                    {/* Copyright */}
                    <p className="text-center md:text-left">
                        &copy; {new Date().getFullYear()} AI-Implant ID. All Rights Reserved.
                    </p>
                    
                    {/* Legal/ReCAPTCHA */}
                    <div className="text-center md:text-right text-xs">
                        <p className="text-gray-500">
                            This site is protected by reCAPTCHA and the Google{' '}
                            <Link to="/privacy" className="hover:text-sky-400 underline">Privacy Policy</Link> and{' '}
                            <Link to="/terms" className="hover:text-sky-400 underline">Terms of Service</Link> apply.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;