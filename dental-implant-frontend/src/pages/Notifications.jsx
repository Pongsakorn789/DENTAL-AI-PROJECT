// src/pages/Notifications.jsx

import React from 'react';
import { Clock, CheckCircle2, AlertCircle, RefreshCcw, Bell, ChevronRight } from 'lucide-react';

const mockNotifications = [
    { id: 1, type: 'success', icon: CheckCircle2, color: 'text-green-600', time: '5 minutes ago', message: 'Analysis of Case #CAM-4321 is complete and ready for review.' },
    { id: 2, type: 'update', icon: AlertCircle, color: 'text-yellow-600', time: '1 hour ago', message: 'System update available: Improved accuracy for Zimmer implants.' },
    { id: 3, type: 'system', icon: RefreshCcw, color: 'text-blue-600', time: 'Yesterday', message: 'API maintenance is complete. All services are now operational.' },
    { id: 4, type: 'success', icon: CheckCircle2, color: 'text-green-600', time: '2 days ago', message: 'New analysis report for Patient X is available.' },
];

const Notifications = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                
                {/* Header */}
                <div className="flex justify-between items-center mb-8 border-b pb-4">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                        <Bell size={28} className="text-blue-600" />
                        <span>Notifications Center</span>
                    </h1>
                    <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1 font-medium">
                        <CheckCircle2 size={16} />
                        <span>Mark all as read</span>
                    </button>
                </div>

                {/* Notifications Feed */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-lg divide-y divide-gray-100">
                    {mockNotifications.map((notif) => (
                        <NotificationItem key={notif.id} notif={notif} />
                    ))}
                    
                    {/* Placeholder if empty */}
                    {mockNotifications.length === 0 && (
                        <div className="p-12 text-center text-gray-500">
                            <Clock size={32} className="mx-auto mb-3" />
                            <p>No new notifications at this time.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const NotificationItem = ({ notif }) => (
    <div className="flex items-start p-4 hover:bg-gray-50 transition-colors duration-150">
        <div className={`p-2 rounded-full ${notif.color} bg-opacity-10 mr-4 mt-1 flex-shrink-0`}>
            <notif.icon size={20} className={notif.color} />
        </div>
        <div className="flex-grow">
            <p className="text-gray-800 font-medium">{notif.message}</p>
            <p className="text-xs text-gray-500 mt-1 flex items-center space-x-1">
                <Clock size={12} />
                <span>{notif.time}</span>
            </p>
        </div>
        <ChevronRight size={18} className='text-gray-400 ml-4 mt-2' />
    </div>
);

export default Notifications;