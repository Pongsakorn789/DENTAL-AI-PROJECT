import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    ChevronDown, ZoomIn, ZoomOut, RotateCcw, Download, Printer, 
    BarChart3, CheckCircle2, Move, ChevronLeft, Activity, 
    Ruler, Trash2, Edit3, Target, MousePointer2, SearchX, List, 
    Eye, EyeOff, Save, Palette, X
} from 'lucide-react';

// Fallback image (เปลี่ยน path ตามโปรเจกต์คุณ)
import xrayImage7 from '../assets/7.png'; 

// สีสำหรับเส้นวัดระยะ (User Measuring Tool)
const MEASURE_COLORS = ["#06b6d4", "#ef4444", "#22c55e", "#eab308", "#f97316", "#8b5cf6", "#ec4899"];

// 🎨 สีสำหรับแยกยี่ห้อ (Brand Colors)
const BRAND_PALETTE = [
    "#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#6366f1"
];

const getBrandColor = (brandName) => {
    if (!brandName) return "#9ca3af";
    let hash = 0;
    for (let i = 0; i < brandName.length; i++) {
        hash = brandName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % BRAND_PALETTE.length;
    return BRAND_PALETTE[index];
};

// --- ข้อมูลจำลอง (Demo Data) ---
const DEMO_RESULT = {
    caseId: 'EXAMPLE-001',
    timestamp: new Date().toISOString(),
    count: 2,
    implants: [
        {
            id: 'demo-1', box: [35, 20, 12, 35], manufacturer: 'Straumann', type: 'Bone Level Tapered',
            size: 'Ø 4.1mm x 10mm', risk: 'Low', confidence: 0.98, position: '#46', boneLevel: '1.5',
            osseointegration: 'High', notes: 'Good primary stability.'
        },
        {
            id: 'demo-2', box: [55, 22, 11, 33], manufacturer: 'Osstem', type: 'TS III',
            size: 'Ø 3.5mm x 11mm', risk: 'Medium', confidence: 0.85, position: '#44', boneLevel: '2.0',
            osseointegration: 'Moderate', notes: 'Check bone density.'
        }
    ]
};

const Result = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // --- Data Setup ---
    const { result: apiResult, uploadedFile } = location.state || {};
    const hasUploadedFile = !!uploadedFile;
    const isDemoMode = !hasUploadedFile;
    const displayResult = isDemoMode ? DEMO_RESULT : (apiResult || { caseId: '-', timestamp: new Date(), implants: [] });
    const displayImage = uploadedFile || xrayImage7; 
    const hasImplants = displayResult.implants && displayResult.implants.length > 0;

    const [selectedImplant, setSelectedImplant] = useState(null);
    
    // --- Tools State ---
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isMeasuring, setIsMeasuring] = useState(false); 
    const [measurements, setMeasurements] = useState([]); 
    const [tempPoint, setTempPoint] = useState(null); 
    const imageContainerRef = useRef(null);
    const [pixelRatio, setPixelRatio] = useState(1); 
    const [isCalibrated, setIsCalibrated] = useState(false);

    // --- Dragging & Editing State ---
    const [dragTarget, setDragTarget] = useState(null); // { id: string, point: 'p1' | 'p2' }
    const [editingMeasure, setEditingMeasure] = useState(null); // Object เส้นที่จะแก้

    useEffect(() => {
        if (hasImplants) setSelectedImplant(displayResult.implants[0]);
        else setSelectedImplant(null);

        if (isDemoMode) {
            setMeasurements([{
                id: 'demo-line', x1: 150, y1: 100, x2: 250, y2: 100, 
                pxLength: 100, visible: true, name: 'Sample Measure', color: '#ef4444', type: 'Width'
            }]);
        } else {
            setMeasurements([]);
        }
    }, [displayResult, isDemoMode, hasImplants]);

    // --- Window Event Listeners for Dragging ---
    useEffect(() => {
        const handleWindowMouseMove = (e) => {
            if (dragTarget) handleDragMove(e);
        };
        const handleWindowMouseUp = () => {
            if (dragTarget) setDragTarget(null);
        };

        if (dragTarget) {
            window.addEventListener('mousemove', handleWindowMouseMove);
            window.addEventListener('mouseup', handleWindowMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleWindowMouseMove);
            window.removeEventListener('mouseup', handleWindowMouseUp);
        };
    }, [dragTarget, zoom, pan]);

    // --- Helpers ---
    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 5));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 1));
    const handleReset = () => { setZoom(1); setPan({ x: 0, y: 0 }); setTempPoint(null); setIsMeasuring(false); };
    
    const getPixelDistance = (x1, y1, x2, y2) => Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    const getDisplayLength = (pxLength) => !isCalibrated ? (pxLength).toFixed(1) + " px" : (pxLength * pixelRatio).toFixed(2) + " mm";
    
    // --- Actions ---
    const deleteMeasurement = (id) => setMeasurements(measurements.filter(m => m.id !== id));
    const toggleVisibility = (id) => setMeasurements(measurements.map(m => m.id === id ? { ...m, visible: !m.visible } : m));
    
    const saveMeasurementEdit = (id, newName, newColor) => {
        setMeasurements(measurements.map(m => m.id === id ? { ...m, name: newName, color: newColor } : m));
        setEditingMeasure(null);
    };

    // --- Interaction Logic ---

    // 1. สร้างเส้นใหม่ (Click บนรูป)
    const handleImageClick = (e) => {
        if (!isMeasuring || dragTarget) return; 
        
        const rect = imageContainerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / zoom; 
        const y = (e.clientY - rect.top) / zoom;

        if (!tempPoint) { 
            setTempPoint({ x, y }); 
        } else {
            const distPx = getPixelDistance(tempPoint.x, tempPoint.y, x, y);
            setMeasurements([...measurements, { 
                id: Date.now().toString(), x1: tempPoint.x, y1: tempPoint.y, x2: x, y2: y, 
                pxLength: distPx, visible: true, name: `Line #${measurements.length + 1}`, 
                color: MEASURE_COLORS[measurements.length % MEASURE_COLORS.length]
            }]);
            setTempPoint(null);
        }
    };

    // 2. เริ่มลากจุด (MouseDown)
    const handleDragStart = (e, id, pointType) => {
        e.stopPropagation(); 
        if (!isMeasuring) return;
        setDragTarget({ id, point: pointType });
    };

    // 3. กำลังลาก (MouseMove)
    const handleDragMove = (e) => {
        if (!dragTarget || !imageContainerRef.current) return;
        const rect = imageContainerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / zoom;
        const y = (e.clientY - rect.top) / zoom;

        setMeasurements(prev => prev.map(m => {
            if (m.id === dragTarget.id) {
                const updatedM = { ...m };
                if (dragTarget.point === 'p1') { updatedM.x1 = x; updatedM.y1 = y; }
                else { updatedM.x2 = x; updatedM.y2 = y; }
                updatedM.pxLength = getPixelDistance(updatedM.x1, updatedM.y1, updatedM.x2, updatedM.y2);
                return updatedM;
            }
            return m;
        }));
    };

    const getRiskColor = (risk) => {
        if (risk === 'High') return 'text-red-700 bg-red-50 border-red-200';
        if (risk === 'Medium') return 'text-yellow-700 bg-yellow-50 border-yellow-200';
        return 'text-green-700 bg-green-50 border-green-200';
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20 select-none relative">
            
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm print:hidden">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button onClick={() => navigate('/')} className="flex items-center text-gray-600 font-medium hover:text-blue-600 transition">
                        <ChevronLeft size={20} className="mr-1" /> 
                        {isDemoMode ? "Exit Demo" : "Upload New Image"}
                    </button>
                    <div className="flex items-center space-x-3">
                        <button className="p-2 text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition"><Printer size={20} /></button>
                        <button className="flex items-center px-4 py-2 bg-sky-600 text-white rounded-lg font-medium hover:bg-sky-700 transition"><Download size={18} className="mr-2" /> Export PDF</button>
                    </div>
                </div>
            </div>

            {/* Banner Demo Mode */}
            {isDemoMode && (
                <div className="bg-blue-600 text-white text-center py-2 text-sm font-medium shadow-md animate-fade-in-down">
                    You are in <span className="font-bold text-yellow-300">Demo Mode</span>. This is sample data.
                </div>
            )}

            <div className="container mx-auto px-4 py-8 max-w-7xl">
                
                {/* Title Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Analysis Report {isDemoMode && <span className="text-gray-400 text-lg font-normal ml-2">(Sample)</span>}</h1>
                    <p className="text-gray-500 mt-1">Case ID: {displayResult.caseId} | {displayResult.timestamp ? new Date(displayResult.timestamp).toLocaleString() : '-'}</p>
                </div>

                <div className="grid lg:grid-cols-5 gap-8 mb-12">
                    
                    {/* --- LEFT COLUMN: Viewer & Tools --- */}
                    <div className="lg:col-span-3 space-y-4 relative">
                        
                        {/* Toolbar */}
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><ZoomIn size={20} /> X-ray Viewer</h2>
                            <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg border border-gray-200">
                                <ToolBtn icon={ZoomIn} onClick={handleZoomIn} /> 
                                <ToolBtn icon={ZoomOut} onClick={handleZoomOut} /> 
                                <ToolBtn icon={RotateCcw} onClick={handleReset} />
                                <div className="w-px bg-gray-300 mx-1"></div>
                                <button 
                                    onClick={() => { setIsMeasuring(!isMeasuring); setTempPoint(null); }}
                                    className={`p-2 rounded flex items-center gap-2 transition ${isMeasuring ? 'bg-blue-600 text-white shadow' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
                                >
                                    <Ruler size={16} /> <span className="text-xs font-bold">{isMeasuring ? 'Measuring On' : 'Measure'}</span>
                                </button>
                                <button onClick={() => setMeasurements([])} className="p-2 bg-white text-red-600 rounded hover:bg-red-50"><Trash2 size={16} /></button>
                            </div>
                        </div>

                        {/* Measurement List Panel */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm text-sm">
                            <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-100">
                                <span className="font-bold text-gray-700 flex gap-2"><Edit3 size={16}/> Measurements</span>
                                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded font-mono">⚠️ Uncalibrated</span>
                            </div>
                            {measurements.length === 0 && <p className="text-gray-400 italic text-center py-2">No measurements yet. Click 'Measure' to start.</p>}
                            {measurements.map(m => (
                                <div key={m.id} className={`flex gap-2 p-2 rounded border items-center mb-1 transition ${!m.visible ? 'bg-gray-100 opacity-60' : 'bg-gray-50 border-gray-100'}`}>
                                    <button onClick={() => toggleVisibility(m.id)} className="text-gray-400 hover:text-gray-700">
                                        {m.visible ? <Eye size={14}/> : <EyeOff size={14}/>}
                                    </button>
                                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: m.color}}></div>
                                    <span className="font-mono font-bold text-gray-700">{m.name}</span>
                                    <div className="ml-auto flex items-center gap-2">
                                        <span className="font-mono bg-white px-2 rounded border text-xs">{getDisplayLength(m.pxLength)}</span>
                                        <button onClick={() => setEditingMeasure(m)} className="text-gray-400 hover:text-blue-500"><Edit3 size={14}/></button>
                                        <button onClick={() => deleteMeasurement(m.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={14}/></button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Image Canvas Container */}
                        <div className="bg-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-700 relative h-[500px] flex items-center justify-center">
                            
                            <div 
                                className={`transition-transform duration-75 ease-out origin-center flex items-center justify-center w-full h-full ${isMeasuring ? 'cursor-crosshair' : ''}`} 
                                style={{ transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)` }} 
                            >
                                {/* Wrapper: Relative + Inline-Block */}
                                <div className="relative inline-block" onClick={handleImageClick}>
                                    
                                    {/* 1. รูปภาพ (Layer ล่างสุด) */}
                                    <img 
                                        ref={imageContainerRef}
                                        src={displayImage} 
                                        alt="X-ray" 
                                        className="max-h-[500px] w-auto block select-none" 
                                        draggable="false"
                                        style={{ zIndex: 0 }}
                                    />

                                    {/* 2. AI Bounding Boxes (Layer กลาง) */}
                                    {/* สำคัญ: ถ้าวัดอยู่ (isMeasuring) ให้ pointer-events-none เพื่อให้คลิกทะลุไปหาเส้นวัดได้ */}
                                    {hasImplants && displayResult.implants.map((imp, i) => {
                                        const boxColor = getBrandColor(imp.manufacturer);
                                        const isSelected = selectedImplant?.id === imp.id;
                                        return (
                                            <div key={i} 
                                                onClick={(e) => { 
                                                    e.stopPropagation(); 
                                                    if(!isMeasuring) setSelectedImplant(imp); 
                                                }}
                                                className={`absolute transition-all group ${isMeasuring ? 'pointer-events-none' : 'pointer-events-auto cursor-pointer'}`}
                                                style={{
                                                    left: `${imp.box[0]}%`, top: `${imp.box[1]}%`, width: `${imp.box[2]}%`, height: `${imp.box[3]}%`,
                                                    border: `2px solid ${isSelected ? '#fbbf24' : boxColor}`,
                                                    backgroundColor: isSelected ? 'rgba(251, 191, 36, 0.1)' : `${boxColor}22`,
                                                    boxShadow: isSelected ? '0 0 15px rgba(250,204,21,0.6)' : 'none',
                                                    zIndex: 10 // ต่ำกว่าเส้นวัด
                                                }}
                                            >
                                                {/* ป้ายเลข Tag */}
                                                <div 
                                                    className="absolute -top-3 -right-3 w-6 h-6 text-white rounded-full flex items-center justify-center text-xs font-bold border-2 border-white shadow-sm"
                                                    style={{ backgroundColor: isSelected ? '#fbbf24' : boxColor, color: isSelected ? 'black' : 'white' }}>
                                                    {i+1}
                                                </div>
                                            </div>
                                        )
                                    })}

                                    {/* 3. SVG Overlay เส้นวัด (Layer บนสุด) */}
                                    <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none" style={{zIndex: 20}}>
                                        {measurements.map((m) => {
                                            if (!m.visible) return null;
                                            const midX = (m.x1 + m.x2) / 2; const midY = (m.y1 + m.y2) / 2;
                                            return (
                                                <g key={m.id}>
                                                    <line x1={m.x1} y1={m.y1} x2={m.x2} y2={m.y2} stroke={m.color} strokeWidth={2.5/zoom} strokeLinecap="round" />
                                                    
                                                    {/* จุดปลาย 1 (Pointer Events Auto เพื่อให้ลากได้) */}
                                                    <circle 
                                                        cx={m.x1} cy={m.y1} r={6/zoom} fill={m.color} stroke="white" strokeWidth={2/zoom} 
                                                        className={`pointer-events-auto cursor-grab hover:scale-125 transition-transform ${isMeasuring ? '' : 'pointer-events-none'}`}
                                                        onMouseDown={(e) => handleDragStart(e, m.id, 'p1')}
                                                    />
                                                    
                                                    {/* จุดปลาย 2 (Pointer Events Auto) */}
                                                    <circle 
                                                        cx={m.x2} cy={m.y2} r={6/zoom} fill={m.color} stroke="white" strokeWidth={2/zoom} 
                                                        className={`pointer-events-auto cursor-grab hover:scale-125 transition-transform ${isMeasuring ? '' : 'pointer-events-none'}`}
                                                        onMouseDown={(e) => handleDragStart(e, m.id, 'p2')}
                                                    />
                                                    
                                                    <rect x={midX - (25/zoom)} y={midY - (22/zoom)} width={50/zoom} height={16/zoom} fill="rgba(0,0,0,0.6)" rx={4/zoom} />
                                                    <text x={midX} y={midY - (10/zoom)} fill="white" fontSize={10/zoom} fontWeight="bold" textAnchor="middle">{getDisplayLength(m.pxLength)}</text>
                                                </g>
                                            );
                                        })}
                                        {tempPoint && isMeasuring && <circle cx={tempPoint.x} cy={tempPoint.y} r={4/zoom} fill="#fbbf24" className="animate-pulse"/>}
                                    </svg>

                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- RIGHT COLUMN: Details --- */}
                    <div className="lg:col-span-2 relative">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Implant Details</h2>
                        {hasImplants && selectedImplant ? (
                            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md space-y-4 sticky top-24">
                                <div className="flex items-start justify-between pb-4 border-b border-gray-100">
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Manufacturer</p>
                                        <h3 className="text-2xl font-bold" style={{color: getBrandColor(selectedImplant.manufacturer)}}>
                                            {selectedImplant.manufacturer}
                                        </h3>
                                        <p className="text-gray-600 font-medium">{selectedImplant.type}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getRiskColor(selectedImplant.risk)}`}>
                                        {selectedImplant.risk} Risk
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <DetailRow label="Confidence" value={`${(selectedImplant.confidence * 100).toFixed(0)}%`} icon={CheckCircle2} color="text-green-600" />
                                    <DetailRow label="Position" value={selectedImplant.position} icon={Move} />
                                    <DetailRow label="Est. Size" value={selectedImplant.size} icon={BarChart3} />
                                    <DetailRow label="Bone Level" value={`${selectedImplant.boneLevel} mm`} icon={Activity} />
                                </div>
                                <div className="pt-4 border-t border-gray-100">
                                    <p className="text-sm font-medium text-gray-900 mb-2">AI Findings:</p>
                                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg leading-relaxed italic">{selectedImplant.notes}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-100 border border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-500">
                                <Target size={40} className="mx-auto mb-2 opacity-30"/>
                                <p>Select an implant or measure manually.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- BOTTOM SECTION: SUMMARY TABLE --- */}
                {hasImplants && (
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-fade-in-up">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <List size={20} className="text-blue-600"/> Detected Implants Summary
                            </h3>
                            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-bold">Total: {displayResult.implants.length}</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-semibold">
                                    <tr>
                                        <th className="px-6 py-3">No.</th>
                                        <th className="px-6 py-3">Manufacturer</th>
                                        <th className="px-6 py-3">Type</th>
                                        <th className="px-6 py-3">Est. Size</th>
                                        <th className="px-6 py-3 text-center">Confidence</th>
                                        <th className="px-6 py-3 text-center">Risk</th>
                                        <th className="px-6 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {displayResult.implants.map((imp, index) => {
                                        const isSelected = selectedImplant?.id === imp.id;
                                        const brandColor = getBrandColor(imp.manufacturer);
                                        return (
                                            <tr key={imp.id} onClick={() => setSelectedImplant(imp)} className={`cursor-pointer transition hover:bg-blue-50 ${isSelected ? 'bg-blue-50' : 'bg-white'}`}>
                                                <td className="px-6 py-4 font-medium">
                                                    <span className="flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold" style={{backgroundColor: brandColor}}>{index + 1}</span>
                                                </td>
                                                <td className="px-6 py-4 font-bold" style={{color: brandColor}}>{imp.manufacturer}</td>
                                                <td className="px-6 py-4 text-gray-600">{imp.type}</td>
                                                <td className="px-6 py-4 font-mono text-gray-500">{imp.size}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="inline-flex items-center px-2 py-1 rounded bg-green-50 text-green-700 text-xs font-bold border border-green-200">{(imp.confidence * 100).toFixed(0)}%</div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold border ${getRiskColor(imp.risk)}`}>{imp.risk}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="text-blue-600 hover:text-blue-800 font-medium text-xs">View</button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </div>

            {/* --- MODAL: EDIT MEASUREMENT --- */}
            {editingMeasure && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-white rounded-xl p-6 w-80 shadow-2xl transform scale-100 transition-all">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><Edit3 size={18}/> Edit Line</h3>
                            <button onClick={() => setEditingMeasure(null)}><X size={18} className="text-gray-400 hover:text-gray-600"/></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Label Name</label>
                                <input 
                                    type="text" 
                                    value={editingMeasure.name} 
                                    onChange={(e) => setEditingMeasure({...editingMeasure, name: e.target.value})}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"><Palette size={14}/> Line Color</label>
                                <div className="flex flex-wrap gap-2">
                                    {MEASURE_COLORS.map(c => (
                                        <button 
                                            key={c}
                                            onClick={() => setEditingMeasure({...editingMeasure, color: c})}
                                            className={`w-8 h-8 rounded-full border-2 transition ${editingMeasure.color === c ? 'border-gray-600 scale-110' : 'border-transparent'}`}
                                            style={{backgroundColor: c}}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button onClick={() => setEditingMeasure(null)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg text-sm">Cancel</button>
                            <button 
                                onClick={() => saveMeasurementEdit(editingMeasure.id, editingMeasure.name, editingMeasure.color)} 
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
                            >
                                <Save size={16}/> Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

// Sub-components
const ToolBtn = ({ onClick, icon: Icon }) => <button onClick={onClick} className="p-2 text-gray-700 bg-white hover:bg-gray-200 rounded transition border border-transparent hover:border-gray-300"><Icon size={16}/></button>;
const DetailRow = ({ label, value, icon: Icon, color = "text-gray-900" }) => (<div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0"><div className="flex items-center text-gray-500 text-sm"><Icon size={14} className="mr-2" /> {label}</div><div className={`font-semibold text-sm ${color}`}>{value}</div></div>);

export default Result;