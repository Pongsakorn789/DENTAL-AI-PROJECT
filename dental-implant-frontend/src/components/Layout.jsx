// src/components/Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom'; // 1. นำเข้า Outlet
import Header from './Header';
import Footer from './Footer';

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <Header />
      
      {/* 2. เปลี่ยน {children} เป็น <Outlet /> */}
      {/* Outlet เปรียบเสมือน "ช่องว่าง" ที่ Router จะเอาหน้า Home, Result, Settings มาเสียบใส่ */}
      <main>
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default Layout;