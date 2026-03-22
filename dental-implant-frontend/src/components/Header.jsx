// src/components/Header.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FlaskConical, Bell, ChevronDown, User, Settings, LogOut, CheckCircle2, Clock } from 'lucide-react';

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const notifRef = useRef(null);
    const profileRef = useRef(null);

    // 1. ดึงข้อมูล User จาก LocalStorage เป็นค่าเริ่มต้น
    const userEmail = localStorage.getItem('userEmail') || '';
    const initialName = localStorage.getItem('userName') || 'Student Demo';
    const initialAvatar = localStorage.getItem('userPicture') || `https://ui-avatars.com/api/?name=${initialName.replace(' ', '+')}&background=0D8ABC&color=fff`;

    // 🌟 สร้าง State เพื่อให้รูปเปลี่ยนอัตโนมัติ
    const [displayName, setDisplayName] = useState(initialName);
    const [avatar, setAvatar] = useState(initialAvatar);

    // 🌟 [แก้ไขใหม่] เพิ่มเมนู Dashboard (History) เข้าไปในแถบนำทาง
    const navLinks = [
        { name: 'Overview', path: '/' },
        { name: 'Dashboard', path: '/history' }, 
        { name: 'Contact', path: '/contact' },
    ];

    // 2. ฟังก์ชันดึงการแจ้งเตือน
    const fetchNotifications = async () => {
        if (!userEmail) return;
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
            const res = await fetch(`${apiUrl}/notifications/${userEmail}`);
            const json = await res.json();
            
            if (json.status === 'success' && json.data) {
                setNotifications(json.data);
                const unread = json.data.filter(n => !n.is_read).length;
                setUnreadCount(unread);
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        }
    };

    // 🌟 3. ฟังก์ชันดึงรูปโปรไฟล์จริงจาก Database
    const fetchUserSettings = async () => {
        if (!userEmail) return;
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
            const res = await fetch(`${apiUrl}/settings/${userEmail}`);
            const json = await res.json();

            if (json.status === 'success' && json.data) {
                // ถ้ารูปใน DB มี ให้ใช้รูปใน DB
                if (json.data.avatar) {
                    setAvatar(json.data.avatar);
                    localStorage.setItem('userPicture', json.data.avatar); // เซฟทับ Google
                }
                // ถ้าเปลี่ยนชื่อใน DB ให้ใช้ชื่อใน DB
                if (json.data.firstName) {
                    const fullName = `${json.data.firstName} ${json.data.lastName || ''}`.trim();
                    setDisplayName(fullName);
                    localStorage.setItem('userName', fullName);
                }
            }
        } catch (error) {
            console.error("Failed to fetch user settings:", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        fetchUserSettings(); 

        const interval = setInterval(fetchNotifications, 10000); 
        
        // 🌟 ฟังเสียงเรียกจากหน้า Notification ให้ซิงค์ข้อมูลทันที
        window.addEventListener('sync-notifications', fetchNotifications);

        return () => {
            clearInterval(interval);
            window.removeEventListener('sync-notifications', fetchNotifications);
        };
    }, [userEmail]);

    const handleMarkAllRead = async (e) => {
        e.stopPropagation();
        if (!userEmail) return;
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
            await fetch(`${apiUrl}/notifications/${userEmail}/read`, { method: 'POST' });
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            window.dispatchEvent(new Event('sync-notifications'));
            setUnreadCount(0);
        } catch (error) {
            console.error("Error marking read:", error);
        }
    };

    const handleLogout = () => {
        localStorage.clear(); 
        navigate('/login');   
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notifRef.current && !notifRef.current.contains(event.target)) setIsNotifOpen(false);
            if (profileRef.current && !profileRef.current.contains(event.target)) setIsProfileOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (location.pathname === '/login') return null;

    return (
        <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    
                    {/* Logo Section */}
                    <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
                        <div className="bg-blue-600 p-2.5 rounded-xl mr-3 shadow-md shadow-blue-200">
                            <FlaskConical size={24} className="text-white" />
                        </div>
                        <span className="font-extrabold text-2xl text-blue-900 tracking-tight">AI-IMPLANT ID</span>
                    </div>

                    {/* Navigation Center */}
                    <nav className="hidden md:flex space-x-8">
                        {navLinks.map((link) => (
                            <Link 
                                key={link.name} 
                                to={link.path}
                                className={`text-base font-semibold transition-colors duration-200 ${
                                    location.pathname === link.path 
                                    ? 'text-blue-600 border-b-2 border-blue-600 pb-1' 
                                    : 'text-gray-500 hover:text-blue-600'
                                }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Right Section */}
                    <div className="flex items-center space-x-5">
                        
                        {/* 🔔 Notification Dropdown */}
                        <div className="relative" ref={notifRef}>
                            <button 
                                onClick={() => setIsNotifOpen(!isNotifOpen)}
                                className="p-2.5 rounded-full hover:bg-gray-50 text-gray-500 hover:text-blue-600 transition-colors relative"
                            >
                                <Bell size={22} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
                                )}
                            </button>

                            {isNotifOpen && (
                                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transform opacity-100 scale-100 transition-all origin-top-right">
                                    <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                                        <h3 className="font-bold text-gray-800">Notifications</h3>
                                        <button onClick={handleMarkAllRead} className="text-xs text-blue-600 hover:text-blue-800 font-semibold">
                                            Mark all read
                                        </button>
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto">
                                        {notifications.slice(0, 5).map((notif, idx) => (
                                            <div key={idx} className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${!notif.is_read ? 'bg-sky-50/30' : ''}`}>
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <p className={`text-sm ${!notif.is_read ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                                                            {notif.message}
                                                        </p>
                                                        <p className="text-xs text-gray-400 mt-1 flex items-center">
                                                            <Clock size={10} className="mr-1"/> 
                                                            {new Date(notif.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                    {!notif.is_read && <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>}
                                                </div>
                                            </div>
                                        ))}
                                        {notifications.length === 0 && (
                                            <div className="p-6 text-center text-gray-400 text-sm">No new notifications</div>
                                        )}
                                    </div>
                                    <Link to="/notifications" onClick={() => setIsNotifOpen(false)} className="block p-3 text-center text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors">
                                        View All Notifications
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* 👤 Profile Dropdown */}
                        <div className="relative" ref={profileRef}>
                            <button 
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center space-x-3 p-1.5 pr-3 rounded-full border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all focus:outline-none focus:ring-2 focus:ring-blue-100"
                            >
                                <img 
                                    src={avatar} 
                                    alt="User" 
                                    className="w-9 h-9 rounded-full object-cover border border-white shadow-sm"
                                />
                                <span className="text-sm font-bold text-gray-700 hidden sm:block max-w-[100px] truncate">
                                    {displayName.split(' ')[0]}
                                </span>
                                <ChevronDown size={16} className="text-gray-400" />
                            </button>

                            {isProfileOpen && (
                                <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 transform opacity-100 scale-100 transition-all origin-top-right">
                                    <div className="px-4 py-3 border-b border-gray-50 mb-1">
                                        <p className="text-sm font-bold text-gray-900 truncate">{displayName}</p>
                                        <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                                    </div>
                                    <Link to="/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 font-medium transition-colors">
                                        <User size={16} className="mr-3 text-gray-400" /> My Profile
                                    </Link>
                                    <Link to="/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 font-medium transition-colors">
                                        <Settings size={16} className="mr-3 text-gray-400" /> Account Settings
                                    </Link>
                                    <div className="border-t border-gray-50 my-1"></div>
                                    <button 
                                        onClick={handleLogout}
                                        className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors"
                                    >
                                        <LogOut size={16} className="mr-3 text-red-400" /> Sign out
                                    </button>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;