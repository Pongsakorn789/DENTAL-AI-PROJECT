// src/pages/Notifications.jsx
import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, AlertCircle, Bell, ChevronRight, Trash2 } from 'lucide-react';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const userEmail = localStorage.getItem('userEmail');

    const fetchNotifications = async () => {
        if (!userEmail) return;
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
            const res = await fetch(`${apiUrl}/notifications/${userEmail}`);
            const json = await res.json();
            if (json.status === 'success' && json.data) {
                setNotifications(json.data);
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // ถ้า Header อัปเดต ให้หน้านี้อัปเดตด้วย
        window.addEventListener('sync-notifications', fetchNotifications);
        return () => window.removeEventListener('sync-notifications', fetchNotifications);
    }, [userEmail]);

    const handleMarkAllAsRead = async () => {
        if (!userEmail) return;
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
            await fetch(`${apiUrl}/notifications/${userEmail}/read`, { method: 'POST' });
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            
            // 🌟 ตะโกนบอก Header ให้ซิงค์กระดิ่งให้ตรงกัน
            window.dispatchEvent(new Event('sync-notifications'));
        } catch (error) {
            console.error("Failed to mark as read:", error);
        }
    };

    // 🌟 ฟังก์ชันลบแจ้งเตือน
    const handleDelete = async (id) => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
            await fetch(`${apiUrl}/notifications/${id}`, { method: 'DELETE' });
            
            // ลบออกจากหน้าจอ
            setNotifications(prev => prev.filter(n => n.id !== id));
            // บอก Header ให้อัปเดตตัวเลขด้วย
            window.dispatchEvent(new Event('sync-notifications'));
        } catch (error) {
            console.error("Failed to delete notification:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="flex justify-between items-center mb-8 border-b pb-4">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                        <Bell size={28} className="text-blue-600" />
                        <span>Notifications Center</span>
                    </h1>
                    <button 
                        onClick={handleMarkAllAsRead}
                        className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1 font-medium bg-blue-50 px-3 py-1.5 rounded-lg transition"
                    >
                        <CheckCircle2 size={16} />
                        <span>Mark all as read</span>
                    </button>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl shadow-lg divide-y divide-gray-100 overflow-hidden">
                    {notifications.map((notif) => (
                        <NotificationItem key={notif.id} notif={notif} onDelete={handleDelete} />
                    ))}
                    
                    {notifications.length === 0 && (
                        <div className="p-12 text-center text-gray-500">
                            <Clock size={32} className="mx-auto mb-3 text-gray-300" />
                            <p>No new notifications at this time.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const NotificationItem = ({ notif, onDelete }) => {
    let IconComponent = Bell;
    let colorClass = 'text-blue-600';
    let bgClass = 'bg-blue-100';

    if (notif.type === 'success') {
        IconComponent = CheckCircle2; colorClass = 'text-green-600'; bgClass = 'bg-green-100';
    } else if (notif.type === 'warning' || notif.type === 'update') {
        IconComponent = AlertCircle; colorClass = 'text-yellow-600'; bgClass = 'bg-yellow-100';
    }

    const timeString = new Date(notif.timestamp).toLocaleString('en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    return (
        <div className={`flex items-start p-4 transition-colors duration-150 group
            ${!notif.is_read ? 'bg-sky-50/50' : 'bg-white hover:bg-gray-50'}
        `}>
            <div className={`p-2 rounded-full ${bgClass} ${colorClass} mr-4 mt-1 flex-shrink-0`}>
                <IconComponent size={20} />
            </div>
            
            {/* ทำให้สามารถกดพื้นที่ข้อความเพื่อทำแอคชั่นอื่นได้ในอนาคต (เช่นไปหน้า Report) */}
            <div className="flex-grow cursor-pointer pr-4">
                <p className={`font-medium ${!notif.is_read ? 'text-gray-900' : 'text-gray-600'}`}>
                    {notif.message}
                </p>
                <p className="text-xs text-gray-500 mt-1 flex items-center space-x-1">
                    <Clock size={12} />
                    <span>{timeString}</span>
                </p>
            </div>
            
            <div className="flex items-center gap-3">
                {!notif.is_read && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>}
                
                {/* 🌟 ปุ่มลบแจ้งเตือน (ซ่อนอยู่ จะโชว์ตอนเอาเมาส์ชี้) */}
                <button 
                    onClick={() => onDelete(notif.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    title="Delete Notification"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
};

export default Notifications;