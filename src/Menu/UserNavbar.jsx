import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getEmployeeById, authUsers } from '../data/dataCore' // 1. นำเข้าข้อมูล

const UserNavbar = ({ onLogout }) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [activeMenu, setActiveMenu] = useState(location.pathname)
    const [userProfile, setUserProfile] = useState(null) // 2. สร้าง State เก็บข้อมูลผู้ใช้

    useEffect(() => {
        setActiveMenu(location.pathname)

        // --- ส่วนจำลองการ Login ---
        // ในการใช้งานจริง ID นี้ควรมาจาก localStorage หรือ Context หลังจากการ Login
        // ตัวอย่าง: const currentUserId = parseInt(localStorage.getItem('userId'));
        const currentUserId = authUsers['user'].id; // ใช้ ID 11 (สมชาย ช่างไฟ) ตาม authUsers.user

        // 3. ดึงข้อมูลพนักงานจาก dataCore
        const foundUser = getEmployeeById(currentUserId);
        if (foundUser) {
            setUserProfile(foundUser);
        }

    }, [location.pathname])

    const handleLogout = () => {
        // ถ้ามี onLogout function ส่งมาจาก parent component (App.jsx)
        if (onLogout) {
            onLogout() // เรียกใช้ฟังก์ชัน logout จาก App.jsx
        }

        // นำทางไปหน้า login (ใช้ navigate แทน Link เพราะเราต้องทำงานก่อน redirect)
        navigate('/login')
    }


    return (
        <div>
            <div className="p-4 bg-primary text-white fixed" style={{ width: '14rem', height: '100vh' }}>
                {/* Login Box */}
                <div className='bg-gradient p-1 rounded-3 shadow-lg mb-3 ' style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>

                    <div className='d-flex align-items-center '>

                        <div className='position-relative'>
                            <div className='bg-white rounded-circle d-flex align-items-center justify-content-center' style={{ width: '50px', height: '50px' }}>
                                <Link to="profile">
                                    {/* ตรวจสอบว่ามีรูปภาพหรือไม่ ถ้าไม่มีใช้ icon เดิม */}
                                    {userProfile && userProfile.avatar ? (
                                        <img src={userProfile.avatar} alt="Profile" className="rounded-circle" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <i className="bi bi-person-fill text-primary" style={{ fontSize: '28px' }}></i>
                                    )}
                                </Link>
                            </div>
                            <span className='position-absolute bottom-0 end-0 bg-success rounded-circle border border-2 border-white' style={{ width: '14px', height: '14px' }}></span>
                        </div>
                        <div className='ms-3 flex-grow-1'>
                            {/* 4. แสดงข้อมูลแบบ Dynamic */}
                            <small className='mb-0 text-white d-block'>
                                {userProfile ? userProfile.name : 'กำลังโหลด...'}
                            </small>
                            <small className='text-white-50 d-block'>
                                {userProfile ? userProfile.typework : '-'}
                            </small>
                        </div>
                        <button className='text-light bg-transparent border-0' onClick={handleLogout}><i className="bi bi-box-arrow-right"></i></button>
                    </div>

                </div>

                <p className='p-2 mt-3 small'>เมนูหลัก</p>

                {/* Menu Buttons */}
                <div className='d-flex flex-column gap-2'>
                    <Link to="/user" style={{ textDecoration: 'none' }}>
                        <button
                            className={`btn w-100 d-flex align-items-center ${activeMenu === '/user' ? 'btn-primary text-light' : 'btn-light text-dark'}`}
                            onClick={() => setActiveMenu('/user')}
                        >
                            <i className="bi bi-house-door-fill"></i>
                            <span className='ms-2'>หน้าแรก</span>
                        </button>
                    </Link>

                    <Link to="/calendar" style={{ textDecoration: 'none' }}>
                        <button
                            className={`btn w-100 d-flex align-items-center ${activeMenu === '/calendar' ? 'btn-primary text-light' : 'btn-light text-dark'}`}
                            onClick={() => setActiveMenu('/calendar')}
                        >
                            <i className="bi bi-calendar-check"></i>
                            <span className='ms-2'>ปฎิทินงาน</span>
                        </button>
                    </Link>

                    <Link to="/worksheet" style={{ textDecoration: 'none' }}>
                        <button
                            className={`btn w-100 d-flex align-items-center ${activeMenu === '/work-worksheet' ? 'btn-primary text-light' : 'btn-light text-dark'}`}
                            onClick={() => setActiveMenu('/worksheet')}
                        >
                            <i className="bi bi-card-list"></i>
                            <span className='ms-2'>ใบงาน</span>
                        </button>
                    </Link>
                </div>
            </div>

            {/* Notification Button */}
            <Link to="/notification">
                <button
                    className='position-absolute top-3 end-6 btn btn-primary text-light rounded-4'
                    style={{ fontSize: '1.5rem' }}
                    onClick={() => setActiveMenu('/notification')}
                >
                    <i className="bi bi-bell-fill"></i>
                </button>
            </Link>
        </div>
    )
}

export default UserNavbar