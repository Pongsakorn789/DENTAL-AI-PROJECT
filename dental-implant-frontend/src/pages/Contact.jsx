// src/pages/Contact.jsx

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Contact = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [status, setStatus] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setStatus('sending');
        // MOCK SUBMISSION: จำลองการส่งข้อมูล
        setTimeout(() => {
            setStatus('success');
            setFormData({ name: '', email: '', message: '' });
            alert("Thank you! Your message has been received (Mock Submission).");
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-16">
            <div className="container mx-auto px-4 max-w-6xl">
                
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900">
                        Get in Touch
                    </h1>
                    <p className="mt-2 text-lg text-gray-600">
                        We are here to help you with support and technical inquiries.
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-10 bg-white border border-gray-200 rounded-xl shadow-lg p-8">
                    
                    {/* Contact Info (Column 1) */}
                    <div className="lg:col-span-1 space-y-6 p-4 bg-sky-50 rounded-lg">
                        <ContactDetail icon={Mail} label="Email Support" value="support@ai-implantid.edu" />
                        <ContactDetail icon={Phone} label="Phone Inquiry" value="+66 43 202 871" />
                        <ContactDetail icon={MapPin} label="Official Address" value="Mae Fah Luang University, Chiang Rai, Thailand" />
                    </div>

                    {/* Contact Form (Column 2-3) */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-2xl font-bold text-gray-800">Send Us a Message</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <InputField label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
                            <InputField label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} required />
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                <textarea 
                                    name="message" 
                                    rows="4" 
                                    value={formData.message} 
                                    onChange={handleChange} 
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 transition" 
                                    required
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={status === 'sending'}
                                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center space-x-2"
                            >
                                {status === 'sending' ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                        <span>Sending...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send size={18} />
                                        <span>Submit Inquiry</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ContactDetail = ({ icon: Icon, label, value }) => (
    <div className="flex items-start space-x-3">
        <Icon size={20} className="text-blue-600 mt-1 flex-shrink-0" />
        <div>
            <p className="text-sm font-semibold text-gray-800">{label}</p>
            <p className="text-sm text-gray-600">{value}</p>
        </div>
    </div>
);

const InputField = ({ label, name, type = 'text', value, onChange, required }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input 
            type={type} 
            name={name} 
            value={value} 
            onChange={onChange} 
            required={required}
            className="w-full p-3 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 transition" 
        />
    </div>
);

export default Contact;