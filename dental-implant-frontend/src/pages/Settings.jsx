import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    User, Lock, Settings as SettingsIcon, Bell, 
    CreditCard, Camera, Activity, Shield, Mail, 
    Smartphone, Database, CheckCircle2, X, Download, AlertTriangle
} from 'lucide-react';

const settingsMenu = [
    { name: "Profile & Account", icon: User, path: 'profile' },
    { name: "Analysis Preferences", icon: Activity, path: 'analysis' },
    { name: "Security & Privacy", icon: Lock, path: 'security' },
    { name: "Notifications", icon: Bell, path: 'notifications' },
    { name: "Billing & Plans", icon: CreditCard, path: 'billing' },
];

const Settings = () => {
    const [activeSection, setActiveSection] = useState('profile'); 
    const navigate = useNavigate();
    
    // โหลดข้อมูล User เบื้องต้น
    const userEmail = localStorage.getItem('userEmail') || 'student@lamduan.mfu.ac.th';
    const defaultName = localStorage.getItem('userName') || 'Student Demo';
    const defaultAvatar = localStorage.getItem('userPicture') || "https://ui-avatars.com/api/?name=Student+Demo&background=0D8ABC&color=fff&size=128";

    const [settingsData, setSettingsData] = useState({
        firstName: defaultName.split(' ')[0],
        lastName: defaultName.split(' ').slice(1).join(' ') || '',
        avatar: defaultAvatar,
        unit: 'mm',
        confidenceThreshold: true,
        emailNotif: true, 
        webNotif: true,
    });
    
    const [isSaving, setIsSaving] = useState(false);
    const [usageData, setUsageData] = useState({ plan: 'Free', usage: 0, limit: 20 });
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
                const resSettings = await fetch(`${apiUrl}/settings/${userEmail}`);
                const jsonSettings = await resSettings.json();
                if (jsonSettings.status === 'success' && jsonSettings.data) {
                    setSettingsData(prev => ({ ...prev, ...jsonSettings.data }));
                }

                const resUsage = await fetch(`${apiUrl}/usage/${userEmail}`);
                const jsonUsage = await resUsage.json();
                if (jsonUsage.status === 'success') {
                    setUsageData({ plan: jsonUsage.plan, usage: jsonUsage.usage, limit: jsonUsage.limit });
                }
            } catch (error) {
                console.error("Failed to load settings:", error);
            }
        };
        fetchSettings();
    }, [userEmail]);

    const handleUpdate = (field, value) => {
        setSettingsData(prev => ({ ...prev, [field]: value }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if(file.size > 1024 * 1024) { 
                alert("File is too large. Please upload an image under 1MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => { handleUpdate('avatar', reader.result); };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveAll = async () => {
        setIsSaving(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
            const res = await fetch(`${apiUrl}/settings/${userEmail}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settingsData)
            });
            if (res.ok) {
                localStorage.setItem('userPicture', settingsData.avatar);
                localStorage.setItem('userName', `${settingsData.firstName} ${settingsData.lastName}`.trim());
                window.location.reload();
            }
        } catch (error) {
            alert("Error saving settings.");
        }
        setIsSaving(false);
    };

    const executeUpgrade = async (selectedPlan) => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
            const res = await fetch(`${apiUrl}/upgrade/${userEmail}?plan=${selectedPlan}`, { method: 'POST' });
            
            if (res.ok) {
                const newLimit = selectedPlan === 'Enterprise' ? 500 : 100;
                alert(`🎉 Upgraded Successfully to ${selectedPlan}! Your limit is now ${newLimit} scans.`);
                setUsageData(prev => ({ ...prev, plan: selectedPlan, limit: newLimit }));
                setShowUpgradeModal(false);
            }
        } catch (error) {
            alert("Error upgrading plan.");
        }
    };

    // 🔒 ฟังก์ชันโหลดข้อมูล (Export JSON)
    const handleExportData = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
            const res = await fetch(`${apiUrl}/export/${userEmail}`);
            const json = await res.json();
            
            if (json.status === 'success') {
                const dataStr = JSON.stringify(json.data, null, 2);
                const blob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `MFU_Dental_Data_${userEmail}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } else {
                alert("No data available to export.");
            }
        } catch (error) {
            alert("Error exporting data.");
        }
    };

    // 🔒 ฟังก์ชันลบบัญชี
    const handleDeleteAccount = () => {
        const confirmDelete = window.confirm("⚠️ WARNING: This action cannot be undone.\nAre you sure you want to delete your account and all data?");
        if (confirmDelete) {
            alert("Account has been scheduled for deletion. Logging out.");
            localStorage.clear(); // ล้างข้อมูลการล็อกอินทั้งหมด
            navigate('/login');   // เด้งกลับไปหน้าล็อกอิน
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 font-sans relative">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="mb-8 pb-4 border-b">
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <SettingsIcon className="text-blue-600"/> Account Settings
                    </h1>
                </div>
                
                <div className="grid lg:grid-cols-12 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-3">
                        <div className="bg-white border rounded-xl shadow-sm sticky top-24 overflow-hidden">
                            <nav className="p-2 space-y-1">
                                {settingsMenu.map((item) => (
                                    <button 
                                        key={item.path} 
                                        onClick={() => setActiveSection(item.path)} 
                                        className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg ${activeSection === item.path ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        <item.icon size={18} /> {item.name}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="lg:col-span-9">
                        <div className="bg-white border rounded-xl shadow-sm p-6 min-h-[500px] flex flex-col justify-between">
                            
                            {/* --- Profile Content --- */}
                            {activeSection === 'profile' && (
                                <div className='space-y-8 animate-fade-in'>
                                    <div><h3 className='text-xl font-bold text-gray-900'>Profile Information</h3><p className='text-sm text-gray-500'>Update your photo and personal details.</p></div>
                                    <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
                                        <div className="relative group">
                                            <img src={settingsData.avatar} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md" />
                                            <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 shadow-sm border-2 border-white">
                                                <Camera size={16} />
                                                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                                            </label>
                                        </div>
                                        <div><h4 className="font-semibold text-gray-900">Profile Photo</h4></div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2"><label className="text-sm font-medium">First Name</label><input type="text" value={settingsData.firstName} onChange={e => handleUpdate('firstName', e.target.value)} className="w-full p-2.5 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                                        <div className="space-y-2"><label className="text-sm font-medium">Last Name</label><input type="text" value={settingsData.lastName} onChange={e => handleUpdate('lastName', e.target.value)} className="w-full p-2.5 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                                        <div className="space-y-2 md:col-span-2"><label className="text-sm font-medium">Email Address</label><input type="email" value={userEmail} disabled className="w-full p-2.5 bg-gray-100 border rounded-lg text-gray-500 cursor-not-allowed" /></div>
                                    </div>
                                </div>
                            )}

                            {/* --- Analysis Content --- */}
                            {activeSection === 'analysis' && (
                                <div className='space-y-8 animate-fade-in'>
                                    <div><h3 className='text-xl font-bold text-gray-900'>Analysis Preferences</h3><p className='text-sm text-gray-500'>Control how AI detects and measures implants.</p></div>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 border rounded-xl bg-gray-50">
                                            <div><h4 className="font-semibold text-gray-800">Measurement Unit</h4><p className="text-xs text-gray-500">Default unit for rulers and reports.</p></div>
                                            <select value={settingsData.unit} onChange={e => handleUpdate('unit', e.target.value)} className="bg-white border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold">
                                                <option value="mm">Millimeters (mm)</option>
                                                <option value="cm">Centimeters (cm)</option>
                                            </select>
                                        </div>
                                        <div className="flex items-center justify-between p-4 border rounded-xl bg-gray-50">
                                            <div><h4 className="font-semibold text-gray-800 flex items-center gap-2">Strict Mode (Confidence Threshold)</h4><p className="text-xs text-gray-500">Filters out low-confidence AI predictions for cleaner results.</p></div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" checked={settingsData.confidenceThreshold} onChange={e => handleUpdate('confidenceThreshold', e.target.checked)} className="sr-only peer" />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- Notifications Content --- */}
                            {activeSection === 'notifications' && (
                                <div className='space-y-8 animate-fade-in'>
                                    <div><h3 className='text-xl font-bold text-gray-900'>Notification Settings</h3><p className='text-sm text-gray-500'>Manage how you receive alerts and updates.</p></div>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 border rounded-xl bg-gray-50">
                                            <div><h4 className="font-semibold text-gray-800 flex items-center gap-2"><Mail size={16}/> Email Alerts</h4><p className="text-xs text-gray-500">Receive an email when AI finishes processing an image.</p></div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" checked={settingsData.emailNotif} onChange={e => handleUpdate('emailNotif', e.target.checked)} className="sr-only peer" />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>
                                        
                                        {/* 🌟 [ของใหม่] สวิตช์กระดิ่งเว็บปลดล็อกแล้ว! */}
                                        <div className="flex items-center justify-between p-4 border rounded-xl bg-gray-50">
                                            <div><h4 className="font-semibold text-gray-800 flex items-center gap-2"><Bell size={16}/> Web Notifications</h4><p className="text-xs text-gray-500">Show red dot alerts in the bell menu.</p></div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" checked={settingsData.webNotif} onChange={e => handleUpdate('webNotif', e.target.checked)} className="sr-only peer" />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- Security & Privacy Content (ใหม่!) --- */}
                            {activeSection === 'security' && (
                                <div className='space-y-8 animate-fade-in'>
                                    <div>
                                        <h3 className='text-xl font-bold text-gray-900'>Security & Privacy</h3>
                                        <p className='text-sm text-gray-500'>Manage your data and account security.</p>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm flex justify-between items-center">
                                            <div>
                                                <h4 className="font-bold text-gray-800 flex items-center gap-2"><Download size={18}/> Export My Data</h4>
                                                <p className="text-xs text-gray-500 mt-1 max-w-sm">Download all your clinical analysis history in JSON format. Compatible with PDPA standards.</p>
                                            </div>
                                            <button onClick={handleExportData} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition flex items-center gap-2 border border-gray-300">
                                                Export JSON
                                            </button>
                                        </div>

                                        <div className="border border-red-200 rounded-xl p-6 bg-red-50 shadow-sm flex justify-between items-center">
                                            <div>
                                                <h4 className="font-bold text-red-700 flex items-center gap-2"><AlertTriangle size={18}/> Delete Account</h4>
                                                <p className="text-xs text-red-500 mt-1 max-w-sm">Permanently remove your account and all associated data. This action cannot be undone.</p>
                                            </div>
                                            <button onClick={handleDeleteAccount} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition flex items-center gap-2 shadow-sm">
                                                Delete Account
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- Billing & Plans Content --- */}
                            {activeSection === 'billing' && (
                                <div className='space-y-8 animate-fade-in'>
                                    <div><h3 className='text-xl font-bold text-gray-900'>Billing & Usage</h3><p className='text-sm text-gray-500'>View your current plan and API usage limits.</p></div>
                                    
                                    {/* Current Plan Card */}
                                    <div className={`rounded-2xl p-6 text-white shadow-lg transition-all ${usageData.plan === 'Pro' ? 'bg-gradient-to-r from-blue-600 to-sky-500' : usageData.plan === 'Enterprise' ? 'bg-gradient-to-r from-purple-600 to-pink-500' : 'bg-gradient-to-r from-gray-700 to-gray-500'}`}>
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Current Plan</span>
                                                <h2 className="text-2xl font-bold mt-2 flex items-center gap-2">{usageData.plan === 'Free' ? 'Academic' : usageData.plan} License <Shield size={20}/></h2>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-3xl font-extrabold">{usageData.plan === 'Enterprise' ? '$299' : usageData.plan === 'Pro' ? '$99' : '$0'}</p>
                                                <p className="text-sm opacity-80">/ month</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setShowUpgradeModal(true)} 
                                            className="bg-white text-gray-900 font-bold px-6 py-2.5 rounded-lg hover:bg-gray-50 transition w-full sm:w-auto shadow-sm"
                                        >
                                            Change Plan
                                        </button>
                                    </div>

                                    {/* Usage Stats */}
                                    <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm">
                                        <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Database size={18}/> Monthly AI Scans</h4>
                                        <div className="flex justify-between text-sm font-semibold text-gray-600 mb-2">
                                            <span>
                                                <span className={usageData.usage >= usageData.limit ? 'text-red-500' : 'text-blue-600'}>
                                                    {usageData.usage}
                                                </span> Used
                                            </span>
                                            <span>{usageData.limit} Limit</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-3 mb-2 overflow-hidden border border-gray-200">
                                            <div 
                                                className={`h-3 rounded-full transition-all duration-1000 ${usageData.usage >= usageData.limit ? 'bg-red-500' : 'bg-blue-500'}`} 
                                                style={{ width: `${Math.min((usageData.usage / usageData.limit) * 100, 100)}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-gray-500 text-right">Based on total scans connected to your account.</p>
                                    </div>
                                </div>
                            )}
                            
                            {/* ปุ่ม Save สากล (ซ่อนตอนอยู่หน้า Security) */}
                            {activeSection !== 'security' && (
                                <div className="pt-6 mt-8 flex justify-end border-t border-gray-100">
                                    <button 
                                        onClick={handleSaveAll} 
                                        disabled={isSaving} 
                                        className="bg-blue-600 text-white font-bold py-2.5 px-8 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 shadow-md"
                                    >
                                        {isSaving ? "Saving..." : "Save Changes"}
                                    </button>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>

            {/* 🌟 --- MODAL: UPGRADE PLAN --- */}
            {showUpgradeModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in px-4">
                    <div className="bg-white rounded-2xl p-8 max-w-4xl w-full shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Upgrade Your Plan</h2>
                                <p className="text-gray-500">Select the plan that best fits your clinical needs.</p>
                            </div>
                            <button onClick={() => setShowUpgradeModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
                                <X size={24} className="text-gray-400 hover:text-red-500"/>
                            </button>
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-6">
                            {/* Free / Academic Plan */}
                            <div className="border border-gray-200 rounded-xl p-6 flex flex-col bg-gray-50 opacity-70">
                                <h3 className="text-lg font-bold text-gray-800">Academic</h3>
                                <p className="text-3xl font-extrabold mt-2">$0<span className="text-sm text-gray-500 font-normal">/mo</span></p>
                                <ul className="mt-4 space-y-3 text-sm text-gray-600 flex-grow">
                                    <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-gray-400"/> 20 Scans / month</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-gray-400"/> Standard Support</li>
                                </ul>
                                <button disabled className="mt-6 w-full py-2 bg-gray-200 text-gray-500 rounded-lg font-bold cursor-not-allowed">
                                    {usageData.plan === 'Free' ? 'Current Plan' : 'Downgrade Unavailable'}
                                </button>
                            </div>

                            {/* Pro Plan */}
                            <div className={`border-2 rounded-xl p-6 flex flex-col relative ${usageData.plan === 'Pro' ? 'border-blue-500 bg-blue-50' : 'border-blue-200 hover:border-blue-400 transition shadow-sm'}`}>
                                {usageData.plan === 'Pro' && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold">Current Plan</span>}
                                <h3 className="text-lg font-bold text-blue-700">Professional</h3>
                                <p className="text-3xl font-extrabold mt-2 text-gray-900">$99<span className="text-sm text-gray-500 font-normal">/mo</span></p>
                                <ul className="mt-4 space-y-3 text-sm text-gray-600 flex-grow">
                                    <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-500"/> 100 Scans / month</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-500"/> Advanced AI Precision</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-500"/> Priority Support</li>
                                </ul>
                                <button 
                                    onClick={() => executeUpgrade('Pro')}
                                    disabled={usageData.plan === 'Pro'}
                                    className={`mt-6 w-full py-2 rounded-lg font-bold transition ${usageData.plan === 'Pro' ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                                    {usageData.plan === 'Pro' ? 'Active' : 'Select Pro'}
                                </button>
                            </div>

                            {/* Enterprise Plan */}
                            <div className={`border-2 rounded-xl p-6 flex flex-col relative ${usageData.plan === 'Enterprise' ? 'border-purple-500 bg-purple-50' : 'border-purple-200 hover:border-purple-400 transition shadow-sm'}`}>
                                {usageData.plan === 'Enterprise' && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold">Current Plan</span>}
                                <h3 className="text-lg font-bold text-purple-700">Enterprise</h3>
                                <p className="text-3xl font-extrabold mt-2 text-gray-900">$299<span className="text-sm text-gray-500 font-normal">/mo</span></p>
                                <ul className="mt-4 space-y-3 text-sm text-gray-600 flex-grow">
                                    <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-purple-500"/> 500 Scans / month</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-purple-500"/> API Access</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-purple-500"/> 24/7 Phone Support</li>
                                </ul>
                                <button 
                                    onClick={() => executeUpgrade('Enterprise')}
                                    disabled={usageData.plan === 'Enterprise'}
                                    className={`mt-6 w-full py-2 rounded-lg font-bold transition ${usageData.plan === 'Enterprise' ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700'}`}>
                                    {usageData.plan === 'Enterprise' ? 'Active' : 'Select Enterprise'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;