// src/pages/History.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    History as HistoryIcon, Search, Calendar, 
    ChevronRight, Activity, FileText, Database, User
} from 'lucide-react';

const History = () => {
    const navigate = useNavigate();
    const [historyData, setHistoryData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    const userEmail = localStorage.getItem('userEmail') || 'student@lamduan.mfu.ac.th';

    useEffect(() => {
        const fetchHistory = async () => {
            setIsLoading(true);
            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
                const res = await fetch(`${apiUrl}/history/${userEmail}`);
                const json = await res.json();
                
                if (json.status === 'success' && json.data) {
                    setHistoryData(json.data);
                }
            } catch (error) {
                console.error("Failed to load history:", error);
            }
            setIsLoading(false);
        };

        fetchHistory();
    }, [userEmail]);

    // ฟังก์ชันกรองข้อมูลตามช่องค้นหา
    const filteredHistory = historyData.filter(caseItem => 
        caseItem.caseId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // สรุปสถิติเบื้องต้น
    const totalCases = historyData.length;
    const totalImplants = historyData.reduce((sum, item) => sum + (item.count || 0), 0);

    return (
        <div className="min-h-screen bg-gray-50 py-8 font-sans">
            <div className="container mx-auto px-4 max-w-7xl">
                
                {/* Header & Stats */}
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3 mb-6">
                        <Database className="text-blue-600" size={32} /> Patient Summary Dashboard
                    </h1>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                            <div className="p-4 bg-blue-50 text-blue-600 rounded-lg"><FileText size={24} /></div>
                            <div>
                                <p className="text-sm text-gray-500 font-bold uppercase">Total Cases</p>
                                <p className="text-3xl font-black text-gray-900">{totalCases}</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-lg"><Activity size={24} /></div>
                            <div>
                                <p className="text-sm text-gray-500 font-bold uppercase">Implants Detected</p>
                                <p className="text-3xl font-black text-gray-900">{totalImplants}</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex justify-center flex-col">
                            <label className="text-sm font-bold text-gray-500 mb-2 uppercase">Search Case ID</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input 
                                    type="text" 
                                    placeholder="e.g. AI-177..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-100/50 flex justify-between items-center">
                        <h2 className="font-bold text-gray-800 flex items-center gap-2"><HistoryIcon size={18} /> Recent Analysis History</h2>
                    </div>
                    
                    {isLoading ? (
                        <div className="p-12 text-center text-gray-500">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            Loading patient data...
                        </div>
                    ) : filteredHistory.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold">
                                    <tr>
                                        <th className="px-6 py-4">Case ID</th>
                                        <th className="px-6 py-4">Date & Time</th>
                                        <th className="px-6 py-4">Implants Found</th>
                                        <th className="px-6 py-4">AI Model Used</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredHistory.map((item) => {
                                        const dateObj = new Date(item.timestamp);
                                        return (
                                            <tr key={item._id} className="hover:bg-blue-50/50 transition">
                                                <td className="px-6 py-4 font-mono font-bold text-blue-700">{item.caseId}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <Calendar size={14} className="text-gray-400" />
                                                        {dateObj.toLocaleDateString()} <span className="text-gray-400">|</span> {dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full text-xs">
                                                        {item.count} Implants
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-bold text-gray-500 uppercase bg-gray-100 px-2 py-1 rounded border">
                                                        {item.ai_model_used || 'Unknown'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {/* สมมติว่าปุ่มนี้จะส่ง Data กลับไปโชว์ที่หน้า Result ได้ (ถ้าในอนาคตเราอยากทำฟีเจอร์โหลดรูปเดิมมาดู) */}
                                                    <button 
                                                        onClick={() => navigate('/result', { state: { result: item } })}
                                                        className="text-blue-600 hover:text-white border border-blue-600 hover:bg-blue-600 px-4 py-1.5 rounded-lg font-bold transition text-xs shadow-sm flex items-center justify-center ml-auto gap-1"
                                                    >
                                                        View Report <ChevronRight size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-16 text-center text-gray-400 flex flex-col items-center">
                            <Database size={48} className="mb-4 opacity-20" />
                            <p className="text-lg font-semibold text-gray-600 mb-1">No case history found.</p>
                            <p className="text-sm">Start by analyzing a new dental X-ray image.</p>
                            <button onClick={() => navigate('/')} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition shadow-md">
                                Go to Upload
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default History;