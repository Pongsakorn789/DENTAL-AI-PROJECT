// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlaskConical, AlertCircle } from 'lucide-react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";

// ⚠️ เอา Client ID ที่ได้จาก Google Cloud Console มาใส่ตรงนี้
const GOOGLE_CLIENT_ID = "665789589682-jkevrsqabs1netdc9d56neohpbd1qftd.apps.googleusercontent.com";

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleGoogleSuccess = (credentialResponse) => {
    try {
      // ถอดรหัส Token ที่ Google ส่งมาให้
      const decodedInfo = jwtDecode(credentialResponse.credential);
      const userEmail = decodedInfo.email;

      // --- 🛡️ ตรวจสอบ Domain ว่าใช่นักศึกษา/บุคลากร MFU หรือไม่ ---
      if (userEmail.endsWith('@lamduan.mfu.ac.th') || userEmail.endsWith('@mfu.ac.th')) {
        
        // ✅ ผ่าน: บันทึกข้อมูลจริงที่ได้จาก Google ลง LocalStorage
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', userEmail);
        localStorage.setItem('userName', decodedInfo.name); // ได้ชื่อจริง-นามสกุลจริง
        localStorage.setItem('userPicture', decodedInfo.picture); // ได้รูปโปรไฟล์จริง

        setError('');
        navigate('/'); // ล็อกอินสำเร็จ ไปหน้าหลัก

      } else {
        // ❌ ไม่ผ่าน: แจ้งเตือนและไม่ให้เข้า
        setError('Access Denied: Please use your @lamduan.mfu.ac.th email only.');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
      console.error("JWT Decode Error:", err);
    }
  };

  const handleGoogleError = () => {
    setError('Google Sign-In was unsuccessful. Please try again.');
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
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

          {/* Form Area */}
          <div className="p-8">
            <div className="mb-8 text-center">
               <h3 className="text-gray-800 font-semibold text-lg">University Login</h3>
               <p className="text-gray-500 text-sm mt-1">Please sign in with your MFU Google account to continue.</p>
            </div>

            {/* ปุ่ม Google Sign-In */}
            <div className="flex justify-center mb-4">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap
                  theme="filled_blue"
                  shape="rectangular"
                  size="large"
                  text="signin_with"
                />
            </div>

            {/* Error Message */}
            {error && (
                <div className="flex items-start gap-2 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm animate-shake">
                    <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400">
                * This system is restricted to Mae Fah Luang University students and staff only.
              </p>
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;