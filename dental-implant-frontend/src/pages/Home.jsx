// src/pages/Home.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    UploadCloud, CheckCircle, Clock, Zap, Cpu, Scan, FileText, ArrowRight, BarChart3, Users, 
    ShieldCheck, Lock, Lightbulb, TrendingUp, X, ChevronDown, RotateCcw, Layers, Box
} from 'lucide-react'; 

// ตรวจสอบ path รูปภาพให้ตรงกับโฟลเดอร์ของคุณ
import xrayImage2 from '../assets/2.png'; 

// ----------------------------------------------------------------
// Component ย่อย: ImageUploadSection 
// (อัปเกรด: รับ props aiModel และ setAiModel เพื่อทำ Dropdown)
// ----------------------------------------------------------------
const ImageUploadSection = ({ onAnalyze, status, uploadedFile, className, aiModel, setAiModel }) => {
    const [fileName, setFileName] = useState(uploadedFile ? uploadedFile.name : null);
    const [selectedFile, setSelectedFile] = useState(uploadedFile || null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [imagePreviewUrl, setImagePreviewUrl] = useState(uploadedFile ? URL.createObjectURL(uploadedFile) : null); 

    const handleFileChange = (event) => {
        const file = event.target.files ? event.target.files[0] : null;
        if (file) {
            setFileName(file.name);
            setSelectedFile(file);
            setImagePreviewUrl(URL.createObjectURL(file)); 
        }
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setIsDragOver(false);
        const file = event.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            setFileName(file.name);
            setSelectedFile(file);
            setImagePreviewUrl(URL.createObjectURL(file)); 
        } else {
            alert("Please drop a valid image file (JPG, PNG).");
        }
    };

    // 🔴 ฟังก์ชันลบรูป (Reset)
    const handleRemove = () => {
        setFileName(null);
        setSelectedFile(null);
        setImagePreviewUrl(null);
        const fileInput = document.getElementById('xray-upload-input');
        if (fileInput) fileInput.value = '';
    };

    // 🔄 ฟังก์ชันเปลี่ยนรูป
    const handleChange = () => {
        document.getElementById('xray-upload-input').click();
    };

    return (
        <div className={`bg-white border border-gray-200 rounded-2xl p-6 shadow-xl transition-all ${className}`}>
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
                <UploadCloud size={24} className="text-sky-600" />
                <span>Upload X-ray Image</span>
            </h3>

            {/*  ส่วนเลือกโมเดล AI (เพิ่มใหม่) */}
            <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Cpu size={14} /> Select AI Model
                </label>
                <div className="relative">
                    <select 
                        value={aiModel}
                        onChange={(e) => setAiModel(e.target.value)}
                        className="w-full appearance-none bg-white border border-gray-300 text-gray-700 py-2.5 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-sky-500 font-medium shadow-sm transition-all"
                    >
                        <option value="mfu"> MFU Model (25 Classes - MFU)</option>
                        <option value="roboflow"> Roboflow Model (4 Major Brands)</option>
                        
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <ChevronDown size={16} />
                    </div>
                </div>
                <p className="text-[10px] text-gray-400 mt-1.5 ml-1">
                    {aiModel === 'roboflow' 
                        ? "*High Accuracy: Straumann, Astra, Nobel, Osstem" 
                        : "*Legacy Support: Covers 25 older implant types"}
                </p>
            </div>
            {/*  จบส่วนเลือกโมเดล */}

            {imagePreviewUrl ? (
                // --- VIEW MODE ---
                <div className="space-y-4 animate-fade-in-up">
                    <div className="relative border-2 border-sky-200 rounded-xl overflow-hidden bg-gray-50 h-[300px] flex items-center justify-center group">
                        <img src={imagePreviewUrl} alt="X-ray Preview" className="w-full h-full object-contain" />
                        <div className="absolute bottom-2 left-2 right-2 bg-black/60 text-white text-xs py-1 px-3 rounded-lg truncate text-center backdrop-blur-sm">
                            {fileName}
                        </div>
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleRemove(); }}
                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-lg transform hover:scale-110"
                            title="Remove image"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <span className="text-sm text-green-600 font-bold flex items-center">
                            <CheckCircle size={18} className="mr-1.5" /> Ready
                        </span>
                        <div className="flex items-center space-x-2">
                            <button onClick={handleChange} className="text-sm text-gray-600 hover:text-blue-600 font-medium transition flex items-center py-1.5 px-3 rounded hover:bg-white border border-transparent hover:border-gray-200">
                                <RotateCcw size={16} className="mr-1.5" /> Change
                            </button>
                            <div className="w-px h-4 bg-gray-300 mx-1"></div>
                            <button onClick={handleRemove} className="text-sm text-red-500 hover:text-red-700 font-medium transition flex items-center py-1.5 px-3 rounded hover:bg-red-50">
                                <X size={16} className="mr-1.5" /> Remove
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                // --- UPLOAD MODE ---
                <div
                    className={`flex flex-col items-center justify-center h-[250px] text-center border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 relative group
                                ${isDragOver ? 'border-sky-500 bg-sky-50 scale-[1.02]' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}`}
                    onDrop={handleDrop}
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onClick={() => document.getElementById('xray-upload-input').click()}
                >
                    <div className={`bg-sky-100 p-4 rounded-full mb-4 transition-transform duration-300 ${isDragOver ? 'scale-110' : 'group-hover:scale-110'}`}>
                        <UploadCloud size={40} className="text-sky-600" />
                    </div>
                    <p className="text-lg font-semibold text-gray-700">Click to upload or drag & drop</p>
                    <p className="text-sm text-gray-500 mt-2">Supported formats: JPEG, PNG (Max 10MB)</p>
                </div>
            )}

            <input id="xray-upload-input" name="xray-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />

            {/* ปุ่ม Analyze */}
            <div className="mt-6">
                <button
                    onClick={() => onAnalyze(selectedFile)}
                    disabled={!selectedFile || status === 'analyzing'}
                    className={`w-full py-3.5 px-4 rounded-xl text-lg font-bold text-white transition-all duration-300 shadow-lg flex items-center justify-center space-x-2 relative overflow-hidden
                                ${selectedFile && status !== 'analyzing'
                                    ? 'bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 transform hover:-translate-y-1 hover:shadow-xl'
                                    : 'bg-gray-300 cursor-not-allowed'}`}
                >
                    {status === 'analyzing' ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                            <span>Processing with AI...</span>
                        </>
                    ) : (
                        <>
                            <Zap size={22} fill="currentColor" />
                            <span>Analyze Now</span>
                        </>
                    )}
                </button>
                {status === 'error' && (
                    <p className="text-red-500 text-center text-sm mt-3 font-medium animate-pulse">⚠️ Connection Failed. Is Backend running?</p>
                )}
            </div>
        </div>
    );
};

// ----------------------------------------------------------------
// Main Page Component: Home
// ----------------------------------------------------------------
const Home = () => {
    const navigate = useNavigate();
    const [analysisStatus, setAnalysisStatus] = useState('idle');
    const [uploadedFile, setUploadedFile] = useState(null);
    
    // ✅ เพิ่ม State เก็บค่าโมเดล (Default = roboflow)
    const [aiModel, setAiModel] = useState('roboflow'); 

    // -------------------------------------------------------
    // 🚀 ฟังก์ชันหลัก: เชื่อมต่อกับ Python Backend
    // -------------------------------------------------------
    const handleAnalyze = async (file) => {
        if (!file) return;

        setAnalysisStatus('analyzing');
        setUploadedFile(file);

        const formData = new FormData();
        formData.append('file', file); 
        
        // ✅ ส่งค่า mode ไปให้ Backend ด้วย
        formData.append('mode', aiModel); 

        try {
            console.log(`🚀 Sending image to Backend API (Model: ${aiModel})...`);

            // ส่งไปที่ Python Server
            const response = await fetch('http://127.0.0.1:8000/analyze', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }

            const resultData = await response.json();
            console.log("✅ Data received from Python:", resultData);

            // ส่งข้อมูลไปหน้า Result
            navigate('/result', { 
                state: { 
                    result: resultData, 
                    uploadedFile: URL.createObjectURL(file) 
                } 
            });

        } catch (error) {
            console.error('❌ Analysis failed:', error);
            setAnalysisStatus('error');
            alert(`เชื่อมต่อ Server ไม่สำเร็จ!\n\nสาเหตุ: ${error.message}\n\nคำแนะนำ: กรุณาเช็คว่าเปิดหน้าจอ Terminal (Backend) ทิ้งไว้หรือยัง?`);
        }
    };
    
    // --- Hero Section ---
    const HeroSection = () => (
        <section className="bg-gradient-to-br from-white via-blue-50 to-white pt-28 md:pt-36 pb-20 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-8 relative z-10">
                    <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-[1.15]">
                        Instant <br/>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-blue-700 drop-shadow-sm">Dental Implant</span> <br/>
                        Identification
                    </h1>
                    <p className="text-xl text-gray-600 max-w-lg leading-relaxed">
                        Leverage AI to accurately identify the manufacturer, type, and dimensions of dental implants from a single X-ray in seconds.
                    </p>
                    <div className="flex flex-wrap gap-4 pt-2">
                        <Badge icon={CheckCircle} text="98% Accuracy" color="text-green-600" bg="bg-green-50" />
                        <Badge icon={Clock} text="< 5 Seconds" color="text-yellow-600" bg="bg-yellow-50" />
                        <Badge icon={Cpu} text="AI Powered" color="text-sky-600" bg="bg-sky-50" />
                    </div>
                </div>
                <div className="relative z-10">
                    <div className="absolute -inset-1 bg-gradient-to-r from-sky-400 to-blue-600 rounded-2xl blur opacity-20 animate-pulse"></div>
                    
                    {/* ✅ ส่ง aiModel และ setAiModel เข้าไปใน Component */}
                    <ImageUploadSection 
                        onAnalyze={handleAnalyze} 
                        status={analysisStatus} 
                        uploadedFile={uploadedFile} 
                        className="relative"
                        aiModel={aiModel}
                        setAiModel={setAiModel}
                    />
                </div>
            </div>
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-sky-100 rounded-full blur-3xl opacity-50"></div>
        </section>
    );

    // --- How It Works ---
    const HowItWorksSection = () => (
        <section className="py-24 bg-white relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Your Diagnosis in 3 Simple Steps</h2>
                    <p className="mt-4 text-xl text-gray-500">Streamlined workflow for busy dental professionals.</p>
                </div>
                <div className="grid lg:grid-cols-3 gap-12 relative">
                    <div className="hidden lg:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-sky-200 via-blue-200 to-sky-200 border-t-2 border-dashed border-gray-300 z-0"></div>
                    <StepCard step="1" icon={UploadCloud} title="Upload Radiograph" desc="Upload any panoramic or periapical X-ray (JPG/PNG)." color="text-sky-600" />
                    <StepCard step="2" icon={Zap} title="AI Analysis" desc="Our Deep Learning model detects and measures implants instantly." color="text-blue-600" />
                    <StepCard step="3" icon={FileText} title="View Report" desc="Get a detailed report with brand, size, and confidence score." color="text-indigo-600" />
                </div>
            </div>
        </section>
    );

    // --- Features ---
    const FeaturesSection = () => (
        <section className="py-24 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Why Choose Our AI?</h2>
                    <p className="mt-4 text-xl text-gray-500">Precision technology designed for clinical excellence.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    <FeatureCard icon={Scan} title="Precise Detection" desc="Identifies exact location and axis of implants with pixel-perfect accuracy." color="text-sky-600" />
                    <FeatureCard icon={BarChart3} title="Risk Assessment" desc="Evaluates bone levels and potential risks for better surgical planning." color="text-blue-600" />
                    <FeatureCard icon={ShieldCheck} title="Data Security" desc="Enterprise-grade encryption ensures patient data remains private and secure." color="text-green-600" />
                </div>
            </div>
        </section>
    );
    
    // --- Sample View ---
    const SampleViewSection = () => (
        <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-16">
                <div className="lg:w-1/2">
                    <div className="relative rounded-2xl shadow-2xl overflow-hidden border border-gray-100 group">
                        <img src={xrayImage2} alt="Sample Analysis" className="w-full h-auto transform transition duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-8">
                            <div className="text-white">
                                <p className="font-bold text-lg">Sample Analysis Output</p>
                                <p className="text-sm opacity-90">Detected: Camlog Conelog (97% Confidence)</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="lg:w-1/2 space-y-6">
                    <h2 className="text-4xl font-bold text-gray-900">See the Future of Diagnosis</h2>
                    <p className="text-lg text-gray-600 leading-relaxed">
                        Don't rely on guesswork. Our system compares patient X-rays against a database of thousands of implant models to provide you with the most probable match in seconds.
                    </p>
                    <button onClick={() => navigate('/result')} className="inline-flex items-center px-8 py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition shadow-lg">
                        View Sample Report <ArrowRight className="ml-2" />
                    </button>
                </div>
            </div>
        </section>
    );

    // --- FAQ Section ---
    const FAQSection = () => (
        <section className="py-24 bg-gray-50">
            <div className="max-w-3xl mx-auto px-4">
                <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Frequently Asked Questions</h2>
                <div className="space-y-4">
                    <FAQItem q="How accurate is the system?" a="Our model achieves over 98% accuracy on standard datasets, validated by oral surgeons." />
                    <FAQItem q="Is patient data stored?" a="No. Images are processed in real-time and deleted immediately after analysis for privacy." />
                    <FAQItem q="What file formats are supported?" a="We currently support JPG, PNG, and TIFF formats. DICOM support is coming soon." />
                </div>
            </div>
        </section>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <HeroSection />
            <HowItWorksSection />
            <FeaturesSection />
            <SampleViewSection />
            <FAQSection />
        </div>
    );
};

// --- Helper Components ---

const Badge = ({ icon: Icon, text, color, bg }) => (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold ${color} ${bg} border border-transparent hover:border-current transition`}>
        <Icon size={16} className="mr-2" /> {text}
    </span>
);

const StepCard = ({ step, icon: Icon, title, desc, color }) => (
    <div className="relative z-10 flex flex-col items-center text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition duration-300">
        <div className={`w-16 h-16 rounded-2xl ${color} bg-opacity-10 flex items-center justify-center mb-6`}>
            <Icon size={32} className={color} />
        </div>
        <div className="absolute -top-4 bg-gray-900 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-md">
            {step}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-500 leading-relaxed">{desc}</p>
    </div>
);

const FeatureCard = ({ icon: Icon, title, desc, color }) => (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition group">
        <Icon size={40} className={`${color} mb-6 transform group-hover:scale-110 transition duration-300`} />
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-500">{desc}</p>
    </div>
);

const FAQItem = ({ q, a }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-6 text-left font-semibold text-gray-800 hover:bg-gray-50 transition"
            >
                {q}
                <ChevronDown className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && <div className="p-6 pt-0 text-gray-600 border-t border-gray-50">{a}</div>}
        </div>
    );
};

export default Home;