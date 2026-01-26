// src/components/Header.jsx

import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { 
    Settings, Bell, LogIn, UserPlus, Menu, X, 
    FlaskConical, LogOut, ChevronDown, Clock, CheckCircle2 
} from 'lucide-react'; 

const Header = () => {
    const navigate = useNavigate();
    
    // --- State Management ---
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotiOpen, setIsNotiOpen] = useState(false); // ✅ State สำหรับเปิด/ปิด Notification Dropdown
    const [hasUnread, setHasUnread] = useState(true);    // ✅ State เช็คว่ามีข้อความยังไม่่านมั้ย

    // เช็คสถานะ Login จาก localStorage
    const isLoggedIn = !!localStorage.getItem('isLoggedIn');
    const userProfile = {
        name: localStorage.getItem('userName') || "Student",
        email: localStorage.getItem('userEmail') || "student@mfu.ac.th",
        avatar: localStorage.getItem('userPicture') || "https://ui-avatars.com/api/?name=Student&background=0D8ABC&color=fff"
    };

    // --- Mock Notification Data (สำหรับโชว์ใน Dropdown) ---
    const recentNotifications = [
        { id: 1, text: "Analysis #CAM-4321 is ready", time: "5m ago", isNew: true },
        { id: 2, text: "System update available", time: "1h ago", isNew: false },
        { id: 3, text: "New report created", time: "2d ago", isNew: false },
    ];

    // ปิด Dropdown เมื่อคลิกที่อื่น (Outside Click)
    const notiRef = useRef(null);
    const profileRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notiRef.current && !notiRef.current.contains(event.target)) {
                setIsNotiOpen(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const handleNotiClick = () => {
        setIsNotiOpen(!isNotiOpen);
        if (hasUnread) setHasUnread(false); // กดเปิดแล้วถือว่าอ่านแล้ว จุดแดงหาย
    };

    // Class Styles
    const navLinkClass = ({ isActive }) => 
        `text-sm font-medium transition-colors duration-200 py-2 border-b-2 
         ${isActive ? 'text-blue-600 border-blue-600' : 'text-gray-600 hover:text-blue-600 border-transparent hover:border-gray-200'}`;

    const mobileNavLinkClass = ({ isActive }) =>
        `block px-3 py-2 rounded-md text-base font-medium transition-colors
         ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'}`;

    return (
        <header className="bg-white shadow-sm sticky top-0 z-40 border-b border-gray-100 font-sans print:hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 md:h-20">
                    
                    {/* 1. Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
                            <div className="bg-blue-600 p-1.5 rounded-lg shadow-sm">
                                <FlaskConical size={24} className="text-white" />
                            </div>
                            <span className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-900">
                                AI-IMPLANT ID
                            </span>
                        </Link>
                    </div>

                    {/* 2. Desktop Nav */}
                    <nav className="hidden md:flex space-x-8">
                        <NavLink to="/" className={navLinkClass}>Overview</NavLink>
                        <NavLink to="/result" className={navLinkClass}>Analysis</NavLink>
                        {/* <NavLink to="/history" className={navLinkClass}>History</NavLink> */}
                        <NavLink to="/contact" className={navLinkClass}>Contact</NavLink>
                    </nav>

                    {/* 3. User Actions (Desktop) */}
                    <div className="hidden md:flex items-center space-x-4">
                        {isLoggedIn ? (
                            <>
                                {/* --- 🔔 Notification Dropdown --- */}
                                <div className="relative" ref={notiRef}>
                                    <button 
                                        onClick={handleNotiClick}
                                        className={`p-2 rounded-full transition relative ${isNotiOpen ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
                                    >
                                        <Bell size={20} />
                                        {hasUnread && (
                                            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                                        )}
                                    </button>

                                    {/* The Dropdown Panel */}
                                    {isNotiOpen && (
                                        <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-fade-in-up origin-top-right z-50">
                                            <div className="px-4 py-3 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                                                <h3 className="font-semibold text-gray-800 text-sm">Notifications</h3>
                                                <span className="text-xs text-blue-600 font-medium cursor-pointer hover:underline">Mark all read</span>
                                            </div>
                                            
                                            <div className="max-h-[300px] overflow-y-auto">
                                                {recentNotifications.map((noti) => (
                                                    <div key={noti.id} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors cursor-pointer group">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <p className={`text-sm ${noti.isNew ? 'font-bold text-gray-800' : 'text-gray-600'}`}>
                                                                {noti.text}
                                                            </p>
                                                            {noti.isNew && <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></span>}
                                                        </div>
                                                        <p className="text-xs text-gray-400 flex items-center">
                                                            <Clock size={10} className="mr-1" /> {noti.time}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>

                                            <Link 
                                                to="/notifications" 
                                                onClick={() => setIsNotiOpen(false)}
                                                className="block py-3 text-center text-sm font-medium text-blue-600 hover:bg-blue-50 transition border-t border-gray-100"
                                            >
                                                View All Notifications
                                            </Link>
                                        </div>
                                    )}
                                </div>
                                
                                {/* --- 👤 Profile Dropdown --- */}
                                <div className="relative" ref={profileRef}>
                                    <button 
                                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                                        className="flex items-center space-x-2 p-1 pl-2 pr-3 rounded-full border border-gray-200 hover:shadow-md transition hover:bg-gray-50 group"
                                    >
                                        <img src={userProfile.avatar} alt="Profile" className="w-8 h-8 rounded-full bg-gray-200 object-cover" />
                                        <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate group-hover:text-blue-600 transition-colors">
                                            {userProfile.name}
                                        </span>
                                        <ChevronDown size={14} className="text-gray-400 group-hover:text-blue-500" />
                                    </button>

                                    {isProfileOpen && (
                                        <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl py-2 border border-gray-100 animate-fade-in-up origin-top-right z-50">
                                            <div className="px-4 py-3 border-b border-gray-50 mb-1">
                                                <p className="text-sm font-bold text-gray-900">{userProfile.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{userProfile.email}</p>
                                            </div>
                                            <Link to="/settings" onClick={() => setIsProfileOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 flex items-center gap-2">
                                                <Settings size={16} /> Account Settings
                                            </Link>
                                            <div className="border-t border-gray-50 my-1"></div>
                                            <button 
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                            >
                                                <LogOut size={16} /> Sign out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-blue-600 px-3 py-2 transition-colors">
                                    Log in
                                </Link>
                                <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-5 rounded-lg shadow hover:shadow-lg transition-all flex items-center gap-2">
                                    <UserPlus size={18} /> Sign Up
                                </Link>
                            </>
                        )}
                    </div>

                    {/* 4. Mobile Menu Button */}
                    <div className="flex md:hidden items-center gap-2">
                         {/* Mobile Notification (Link ตรงไปเลยเพื่อความสะดวกในจอมือถือ) */}
                        <Link to="/notifications" className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative">
                            <Bell size={20} />
                            {hasUnread && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>}
                        </Link>
                        
                        <button 
                            onClick={toggleMobileMenu}
                            className="p-2 -mr-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-gray-100 focus:outline-none"
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* 5. Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 shadow-lg absolute w-full left-0 z-50 animate-fade-in-down">
                    <div className="px-4 pt-2 pb-4 space-y-1">
                        <NavLink to="/" onClick={() => setIsMobileMenuOpen(false)} className={mobileNavLinkClass}>Overview</NavLink>
                        <NavLink to="/result" onClick={() => setIsMobileMenuOpen(false)} className={mobileNavLinkClass}>Analysis Result</NavLink>
                        <NavLink to="/contact" onClick={() => setIsMobileMenuOpen(false)} className={mobileNavLinkClass}>Contact</NavLink>
                    </div>
                    
                    <div className="border-t border-gray-100 pt-4 pb-4 px-4 bg-gray-50">
                        {isLoggedIn ? (
                            <div className="flex items-center gap-3">
                                <img src={userProfile.avatar} alt="" className="h-10 w-10 rounded-full border border-white shadow-sm" />
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-bold text-gray-900 truncate">{userProfile.name}</div>
                                    <div className="text-xs text-gray-500 truncate">{userProfile.email}</div>
                                </div>
                                <button onClick={handleLogout} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition">
                                    <LogOut size={20} />
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm">
                                    Sign Up
                                </Link>
                                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-center bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50">
                                    Log In
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;