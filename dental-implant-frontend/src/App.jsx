// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop'; // ✅ Import ตัว ScrollToTop ที่เราสร้างไว้

// Import Pages
import Home from './pages/Home';
import Result from './pages/Result';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Login from './pages/Login';
import History from './pages/History';

const App = () => {
  return (
      <>
        {/* ✅ ให้ ScrollToTop ทำงานทุกครั้งที่มีการเปลี่ยนหน้า */}
        <ScrollToTop /> 
        
        <Routes>
          {/* กลุ่ม 1: หน้าที่มี Header และ Footer (ครอบด้วย Layout) */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/result" element={<Result />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/history" element={<History />} />
          </Route>

          {/* กลุ่ม 2: หน้าที่ไม่มี Header/Footer (อยู่นอก Layout) */}
          {/* ❌ เอา Route /login ที่เคยซ้ำอยู่ข้างบนออก แล้วมาไว้ตรงนี้ที่เดียว */}
          <Route path="/login" element={<Login />} />
          
          {/* หน้า 404 เผื่อคนพิมพ์ URL ผิด */}
          <Route path="*" element={
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-500">
              <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
              <p className="text-xl">Page Not Found</p>
            </div>
          } />
        </Routes>
      </>
  );
};

export default App;