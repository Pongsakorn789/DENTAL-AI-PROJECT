// src/pages/Terms.jsx

import React from 'react';

const Terms = () => {
    return (
        <div className="min-h-screen bg-white py-16">
            <div className="container mx-auto px-4 max-w-3xl">
                
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Terms of Service</h1>
                <p className="text-gray-500 mb-8">Effective Date: November 19, 2025</p>

                <div className="space-y-8 text-gray-700 leading-relaxed">
                    
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">1. Acceptance of Terms</h2>
                        <p>
                            By accessing or using our AI Implant Identification service, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">2. Disclaimer (Medical)</h2>
                        <p className="font-semibold text-red-600">
                            THE AI IMPLANT IDENTIFICATION SERVICE IS A DIAGNOSTIC SUPPORT TOOL ONLY.
                        </p>
                        <p>
                            The results provided by the AI are estimations and should not be used as the sole basis for clinical decisions. Clinicians must always exercise their own professional judgment and confirm the results using available patient records and physical examinations. We are not responsible for any clinical decisions made based on the AI's output.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">3. User Conduct</h2>
                        <p>
                            You agree not to upload any content that is unlawful, harmful, or infringes on the intellectual property rights of others. You must have the necessary consent to upload any patient radiographic image to our service.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Terms;