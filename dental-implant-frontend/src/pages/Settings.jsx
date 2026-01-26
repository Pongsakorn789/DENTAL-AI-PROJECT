import React, { useState } from 'react';
import { 
    User, Lock, Settings as SettingsIcon, Bell, 
    CreditCard, ChevronRight, Camera, Activity, 
    Shield, Mail, Smartphone 
} from 'lucide-react';

// เมนูการตั้งค่าด้านซ้าย
const settingsMenu = [
    { name: "Profile & Account", icon: User, path: 'profile' },
    { name: "Analysis Preferences", icon: Activity, path: 'analysis' }, // เปลี่ยนจาก General ให้ดู Pro ขึ้น
    { name: "Security & Privacy", icon: Lock, path: 'security' },
    { name: "Notifications", icon: Bell, path: 'notifications' },
    { name: "Billing & Plans", icon: CreditCard, path: 'billing' },
];

const Settings = () => {
    // State สำหรับสลับหน้า
    const [activeSection, setActiveSection] = useState('profile'); 

    // ฟังก์ชันเลือกเนื้อหาที่จะโชว์
    const renderContent = () => {
        switch (activeSection) {
            case 'profile': return <ProfileSettings />;
            case 'analysis': return <AnalysisSettings />;
            case 'security': return <SecuritySettings />;
            case 'notifications': return <NotificationSettings />;
            case 'billing': return <BillingSettings />;
            default: return <ProfileSettings />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 font-sans">
            <div className="container mx-auto px-4 max-w-7xl">
                
                {/* Header Page */}
                <div className="mb-8 pb-4 border-b border-gray-200">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <SettingsIcon className="text-blue-600" size={32} />
                        Account Settings
                    </h1>
                    <p className="text-gray-500 mt-2 text-sm ml-11">
                        Manage your profile, AI preferences, and security options.
                    </p>
                </div>

                <div className="grid lg:grid-cols-12 gap-8">
                    {/* --- Sidebar Navigation (Left) --- */}
                    <div className="lg:col-span-3">
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden sticky top-24">
                            <div className="p-4 bg-gray-50 border-b border-gray-100">
                                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Settings Menu</h2>
                            </div>
                            <nav className="p-2 space-y-1">
                                {settingsMenu.map((item) => (
                                    <button
                                        key={item.path}
                                        onClick={() => setActiveSection(item.path)}
                                        className={`w-full text-left flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group
                                            ${activeSection === item.path 
                                                ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm ring-1 ring-blue-100' 
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`
                                        }
                                    >
                                        <span className='flex items-center gap-3'>
                                            <item.icon size={18} className={activeSection === item.path ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'} />
                                            <span>{item.name}</span>
                                        </span>
                                        {activeSection === item.path && <ChevronRight size={16} className='text-blue-500' />}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* --- Content Area (Right) --- */}
                    <div className="lg:col-span-9">
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 min-h-[500px] animate-fade-in">
                            {renderContent()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Sub-Components (เนื้อหาแต่ละส่วน) ---

// 1. Profile Settings (มี Mock Upload Avatar)
const ProfileSettings = () => {
    const [avatar, setAvatar] = useState("https://ui-avatars.com/api/?name=Student+Demo&background=0D8ABC&color=fff&size=128");

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setAvatar(imageUrl);
        }
    };

    return (
        <div className='space-y-8 animate-fade-in'>
            <div>
                <h3 className='text-xl font-bold text-gray-900'>Profile Information</h3>
                <p className='text-sm text-gray-500'>Update your photo and personal details here.</p>
            </div>

            {/* Avatar Section */}
            <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
                <div className="relative group">
                    <img 
                        src={avatar} 
                        alt="Avatar" 
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md group-hover:opacity-90 transition" 
                    />
                    <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 shadow-sm border-2 border-white transition-transform transform hover:scale-110">
                        <Camera size={16} />
                        <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                    </label>
                </div>
                <div>
                    <h4 className="font-semibold text-gray-900">Profile Photo</h4>
                    <p className="text-xs text-gray-500 mb-2">This will be displayed on your account.</p>
                    <button onClick={() => setAvatar("https://ui-avatars.com/api/?name=Student+Demo&background=0D8ABC&color=fff&size=128")} className="text-xs font-medium text-red-500 hover:text-red-700 hover:underline">Remove Photo</button>
                </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">First Name</label>
                    <input type="text" defaultValue="Student" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Last Name</label>
                    <input type="text" defaultValue="Demo" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition" />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">University / Organization</label>
                    <div className="relative">
                        <User className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input type="text" defaultValue="Mae Fah Luang University" className="w-full pl-10 p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 transition outline-none" />
                    </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                     <label className="text-sm font-medium text-gray-700">Email Address</label>
                     <input type="email" defaultValue="student@lamduan.mfu.ac.th" disabled className="w-full p-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed" />
                </div>
            </div>

            <div className="pt-4 flex justify-end border-t border-gray-100">
                <button className="bg-blue-600 text-white font-medium py-2.5 px-6 rounded-lg hover:bg-blue-700 shadow-sm hover:shadow-md transition-all active:scale-95">
                    Save Changes
                </button>
            </div>
        </div>
    );
};

// 2. Analysis Preferences (แทนที่ General Settings เดิม)
const AnalysisSettings = () => (
    <div className='space-y-8 animate-fade-in'>
        <div>
            <h3 className='text-xl font-bold text-gray-900'>Analysis Preferences</h3>
            <p className='text-sm text-gray-500'>Customize how the AI analyzes and displays results.</p>
        </div>

        <div className="space-y-4">
            {/* Unit System */}
            <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-gray-50 hover:bg-white hover:border-blue-200 transition duration-300">
                <div>
                    <h4 className="font-semibold text-gray-800">Measurement Unit</h4>
                    <p className="text-xs text-gray-500">Default unit for implant sizing display.</p>
                </div>
                <select className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 shadow-sm">
                    <option value="mm">Millimeters (mm)</option>
                    <option value="cm">Centimeters (cm)</option>
                </select>
            </div>

            {/* AI Threshold */}
            <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-gray-50 hover:bg-white hover:border-blue-200 transition duration-300">
                <div>
                    <h4 className="font-semibold text-gray-800">Confidence Threshold</h4>
                    <p className="text-xs text-gray-500">Filter out AI predictions with low confidence score.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-600">Min 70%</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
            </div>

            {/* Auto-Calibration */}
            <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-gray-50 hover:bg-white hover:border-blue-200 transition duration-300">
                <div>
                    <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                        Auto-Calibration Suggestion <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">BETA</span>
                    </h4>
                    <p className="text-xs text-gray-500">Suggest calibration scale based on detected object sizes.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
            </div>
        </div>

        <div className="pt-4 flex justify-end border-t border-gray-100">
            <button className="text-gray-600 hover:text-gray-800 text-sm font-medium px-4 py-2 hover:bg-gray-100 rounded-lg transition">
                Reset to Defaults
            </button>
        </div>
    </div>
);

// 3. Security Settings
const SecuritySettings = () => (
    <div className='space-y-8 animate-fade-in'>
        <div>
            <h3 className='text-xl font-bold text-gray-900'>Security & Login</h3>
            <p className='text-sm text-gray-500'>Keep your account secure.</p>
        </div>

        <div className="border border-gray-200 rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-full"><Shield size={24} /></div>
                <div>
                    <h4 className="font-semibold text-gray-900">Password</h4>
                    <p className="text-sm text-gray-500">Last changed: 3 months ago</p>
                </div>
                <button className="ml-auto bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition text-sm font-medium">Change Password</button>
            </div>

            <hr className="border-gray-100"/>

            <div className="flex items-center gap-4">
                <div className="p-3 bg-green-50 text-green-600 rounded-full"><Smartphone size={24} /></div>
                <div>
                    <h4 className="font-semibold text-gray-900">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-500">Add an extra layer of security.</p>
                </div>
                <label className="ml-auto relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
            </div>
        </div>
    </div>
);

// 4. Notification Settings
const NotificationSettings = () => (
    <div className='space-y-8 animate-fade-in'>
        <div>
            <h3 className='text-xl font-bold text-gray-900'>Notification Preferences</h3>
            <p className='text-sm text-gray-500'>Manage how we communicate with you.</p>
        </div>

        <div className="space-y-4">
            <div className="p-4 border border-gray-200 rounded-xl flex items-start gap-3">
                <input type="checkbox" defaultChecked className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                <div>
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2"><Mail size={16} /> Email Notifications</h4>
                    <p className="text-sm text-gray-500">Receive an email when the AI analysis is completed.</p>
                </div>
            </div>
            <div className="p-4 border border-gray-200 rounded-xl flex items-start gap-3">
                <input type="checkbox" className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                <div>
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2"><SettingsIcon size={16} /> Product Updates</h4>
                    <p className="text-sm text-gray-500">Receive news about new features and system maintenance.</p>
                </div>
            </div>
        </div>
    </div>
);

// 5. Billing Settings
const BillingSettings = () => (
    <div className='space-y-8 animate-fade-in'>
         <div>
            <h3 className='text-xl font-bold text-gray-900'>Billing & Plans</h3>
            <p className='text-sm text-gray-500'>Manage your subscription and payment methods.</p>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white shadow-lg">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-blue-100 text-sm font-medium mb-1">Current Plan</p>
                    <h2 className="text-3xl font-bold mb-4">Student Free</h2>
                    <ul className="space-y-2 text-sm text-blue-50">
                        <li className="flex items-center gap-2">✓ 50 AI Analyses / Month</li>
                        <li className="flex items-center gap-2">✓ Basic Report Export</li>
                        <li className="flex items-center gap-2">✓ Community Support</li>
                    </ul>
                </div>
                <button className="bg-white text-blue-700 hover:bg-blue-50 font-bold py-2 px-4 rounded-lg shadow-sm transition">
                    Upgrade to Pro
                </button>
            </div>
        </div>

        <div>
            <h4 className="font-semibold text-gray-900 mb-4">Payment Methods</h4>
            <div className="border border-gray-200 rounded-xl p-8 text-center bg-gray-50">
                <p className="text-gray-500 text-sm">No payment methods added.</p>
            </div>
        </div>
    </div>
);

export default Settings;