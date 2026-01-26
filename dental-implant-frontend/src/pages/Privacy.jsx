// src/pages/Privacy.jsx

import React from 'react';

const Privacy = () => {
    return (
        <div className="min-h-screen bg-white py-16">
            <div className="container mx-auto px-4 max-w-3xl">
                
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Privacy Policy</h1>
                <p className="text-gray-500 mb-8">Last updated: November 19, 2025</p>

                <div className="space-y-8 text-gray-700 leading-relaxed">
                    
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">1. Introduction</h2>
                        <p>
                            We value your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI Implant Identification service. 
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">2. Data We Collect</h2>
                        <p>
                            We collect two types of information: **Personal Identification Data** (e.g., email, name for account creation) and **Health Data (X-ray Images)**.
                        </p>
                        <h3 className="text-xl font-semibold text-gray-800">X-ray Image Handling:</h3>
                        <ul className="list-disc list-inside ml-4 space-y-2">
                            <li>Images are anonymized immediately upon upload and used only for analysis and model improvement.</li>
                            <li>Images are processed over encrypted channels (SSL/TLS).</li>
                            <li>Raw image data is deleted from our servers after the analysis period unless you consent to long-term storage for research purposes.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">3. Security</h2>
                        <p>
                            We employ standard security measures (including encryption and secure server protocols) to protect your data from unauthorized access. Our system is designed with HIPAA compliance standards in mind (mock compliance for demonstration purposes).
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Privacy;