// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlaskConical, ArrowRight, Mail, AlertCircle } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // --- 🛡️ ส่วนสำคัญ: ตรวจสอบ Domain ---
    // จำลองการโหลด (Delay) นิดหน่อยให้ดูสมจริง
    setTimeout(() => {
        const lowerEmail = email.toLowerCase();
        
        // 1. เช็คว่าใช่อีเมลมหาวิทยาลัยหรือไม่?
        // (อนุญาตทั้ง @lamduan.mfu.ac.th และ @mfu.ac.th)
        if (lowerEmail.endsWith('@lamduan.mfu.ac.th') || lowerEmail.endsWith('@mfu.ac.th')) {
            
            // ✅ ผ่าน: บันทึกข้อมูลจำลอง
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userEmail', email);
            // สร้างชื่อปลอมๆ จากอีเมล (เช่น somchai.jai -> Somchai Jai)
            const nameFromEmail = email.split('@')[0].replace('.', ' '); 
            localStorage.setItem('userName', nameFromEmail);
            // รูปโปรไฟล์จำลอง (รูปการ์ตูนตามชื่อ)
            localStorage.setItem('userPicture', `https://ui-avatars.com/api/?name=${nameFromEmail}&background=0D8ABC&color=fff`);

            setLoading(false);
            navigate('/result'); // ไปหน้าหลัก

        } else {
            // ❌ ไม่ผ่าน: แจ้งเตือน
            setLoading(false);
            setError('Access Denied: Please use your @lamduan.mfu.ac.th email only.');
        }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in-up">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white p-3 rounded-xl shadow-lg">
              <FlaskConical size={32} className="text-blue-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">MFU Dental AI</h2>
          <p className="text-blue-100">Dental Implant Analysis System</p>
        </div>

        {/* Form */}
        <div className="p-8">
          <div className="mb-6 text-center">
             <h3 className="text-gray-800 font-semibold text-lg">Student Login</h3>
             <p className="text-gray-500 text-sm mt-1">Please enter your university email to continue.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">University Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                <input 
                  type="email" 
                  required
                  placeholder="6xxxxxxxx@lamduan.mfu.ac.th"
                  value={email}
                  onChange={(e) => {
                      setEmail(e.target.value);
                      setError(''); // พิมพ์ใหม่ให้หาย error
                  }}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition
                    ${error ? 'border-red-300 bg-red-50 focus:ring-red-200' : 'border-gray-200'}`}
                />
              </div>
              {/* Error Message */}
              {error && (
                  <div className="flex items-center gap-2 mt-2 text-red-600 text-sm animate-shake">
                      <AlertCircle size={16} />
                      <span>{error}</span>
                  </div>
              )}
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : (
                <>Sign In <ArrowRight size={20} /></>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">
              * This system is restricted to Mae Fah Luang University students and staff only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;