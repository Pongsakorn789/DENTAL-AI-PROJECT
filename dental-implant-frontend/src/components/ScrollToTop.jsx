// src/components/ScrollToTop.jsx

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
    // ใช้ useLocation เพื่อดึงข้อมูลเกี่ยวกับ URL ปัจจุบัน
    const { pathname } = useLocation();

    // useEffect จะทำงานทุกครั้งที่ค่า 'pathname' มีการเปลี่ยนแปลง
    useEffect(() => {
        // สั่งให้ Browser Scroll ไปที่บนสุด (x=0, y=0)
        window.scrollTo(0, 0); 
    }, [pathname]); // กำหนดให้ Hook นี้ทำงานเมื่อ pathname เปลี่ยนเท่านั้น

    // Component นี้ไม่แสดงผลอะไรออกมา
    return null; 
};

export default ScrollToTop;