// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

// Import Pages
import Home from './pages/Home';
import Result from './pages/Result';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Login from './pages/Login'; // ✅ Import Login มา

const App = () => {
  return (
      <Routes>
        
        {/* กลุ่ม 1: มี Header (User ทั่วไป) */}
        <Route element={<Layout />}>
          <Route path="/login" element={<Login />} />
           <Route path="/" element={<Home />} />
           <Route path="/result" element={<Result />} />
           <Route path="/settings" element={<Settings />} />
           <Route path="/notifications" element={<Notifications />} />
           <Route path="/about" element={<About />} />
           <Route path="/contact" element={<Contact />} />
           <Route path="/privacy" element={<Privacy />} />
           <Route path="/terms" element={<Terms />} />
        </Route>

        {/* กลุ่ม 2: ไม่มี Header (หน้า Login) */}
        {/* ✅ เพิ่มตรงนี้ อยู่นอก Layout */}
        <Route path="/login" element={<Login />} />
        
        <Route path="*" element={<div className="text-center mt-20">404 Not Found</div>} />

      </Routes>
  );
};

export default App;