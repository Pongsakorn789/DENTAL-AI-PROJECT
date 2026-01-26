// src/pages/About.jsx

import React from 'react';
import { Lightbulb, Target, FlaskConical, Users, Code, CheckCircle } from 'lucide-react'; 

const About = () => {
    
    // Component สำหรับแสดงข้อมูลสำคัญ
    const StatsCard = ({ icon: Icon, title, value }) => (
        <div className="bg-white border border-gray-100 rounded-xl p-6 text-center shadow-sm">
            <Icon size={32} className="text-sky-600 mx-auto mb-3" />
            <p className="text-3xl font-bold text-gray-800">{value}</p>
            <p className="text-sm font-medium text-gray-500 mt-1">{title}</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-16">
            <div className="container mx-auto px-4 max-w-7xl">
                
                {/* Hero Section */}
                <div className="text-center mb-16 max-w-4xl mx-auto">
                    <h1 className="text-5xl font-extrabold text-gray-900 leading-tight">
                        Our Vision: Precision in Implantology
                    </h1>
                    <p className="mt-4 text-xl text-gray-600">
                        We are a team of dental experts and AI engineers dedicated to enhancing patient care through instant, accurate implant identification.
                    </p>
                </div>

                {/* Core Stats */}
                <div className="grid md:grid-cols-4 gap-6 mb-16">
                    <StatsCard icon={Users} title="Dental Cases Processed" value="50K+" />
                    <StatsCard icon={Code} title="Model Accuracy Rate" value="98.5%" />
                    <StatsCard icon={Lightbulb} title="Data Scientists" value="7" />
                    <StatsCard icon={Target} title="Implant Brands Covered" value="20+" />
                </div>

                {/* Technology Section */}
                <div className="grid lg:grid-cols-2 gap-12 items-start pt-12">
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold text-gray-800 flex items-center space-x-2">
                            <FlaskConical size={28} className="text-blue-600" />
                            <span>The AI Behind the Diagnosis</span>
                        </h2>
                        <p className="text-lg text-gray-700">
                            Our system utilizes state-of-the-art Deep Convolutional Neural Networks (DCNNs) trained on vast, anonymized datasets of panoramic and periapical radiographs. This allows the model to differentiate minute morphological features unique to each implant manufacturer and model.
                        </p>
                        <p className="text-md text-gray-600 border-l-4 border-sky-400 pl-4 py-2 bg-sky-50 rounded-r-lg">
                            "The goal is not to replace the clinician, but to provide a rapid, objective second opinion and data source during the diagnostic phase."
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Validation & Safety</h3>
                        <ul className="space-y-3 text-gray-700">
                            <li className="flex items-start"><CheckCircle size={18} className="text-green-500 mr-3 mt-1 flex-shrink-0" /> **Clinically Validated:** Results are benchmarked against expert oral surgeons.</li>
                            <li className="flex items-start"><CheckCircle size={18} className="text-green-500 mr-3 mt-1 flex-shrink-0" /> **DICOM Ready:** Future updates will seamlessly integrate with hospital-grade imaging systems.</li>
                            <li className="flex items-start"><CheckCircle size={18} className="text-green-500 mr-3 mt-1 flex-shrink-0" /> **Data Privacy:** Encrypted processing ensures patient data remains secure.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;