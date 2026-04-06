import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

const ManagerNavbar = ({ onLogout }) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [activeMenu, setActiveMenu] = useState(location.pathname)

    // ติดตามการเปลี่ยนแปลงของ URL และอัพเดท activeMenu
    useEffect(() => {
        setActiveMenu(location.pathname)
    }, [location.pathname])

    // ฟังก์ชันจัดการการ Logout
    // วิธีการทำงาน:
    // 1. เรียก onLogout() จาก props (ถ้ามี) เพื่อรีเซ็ต state ใน App.jsx
    // 2. ใช้ navigate('/login') เพื่อนำผู้ใช้กลับไปหน้า Login
    const handleLogout = () => {
        // ถ้ามี onLogout function ส่งมาจาก parent component (App.jsx)
        if (onLogout) {
            onLogout() // เรียกใช้ฟังก์ชัน logout จาก App.jsx
        }

        // นำทางไปหน้า login (ใช้ navigate แทน Link เพราะเราต้องทำงานก่อน redirect)
        navigate('/login')
    }

    return (
        <div className="border-1 bg-primary" style={{
            width: '14rem',
            position: 'fixed',
            height: '100vh',
            top: 0,
            left: 0
        }}>
            {/* ปุ่ม Logout */}
            {/* เปลี่ยนจาก Link เป็น div เพราะเราต้องเรียก handleLogout ก่อน */}
            <div
                onClick={handleLogout}
                style={{ cursor: 'pointer' }} // เพิ่ม cursor pointer เพื่อให้รู้ว่ากดได้
            >
                <div className="d-flex align-items-center justify-content-between border-1 m-3 border-light px-2 py-2 btn btn-outline-danger" style={{ borderRadius: '30px' }}>
                    <div>
                        <span className='text-light ml-4'>Logout</span>
                    </div>
                    <div>
                        <button type="button">
                            <i className="bi bi-box-arrow-right text-light"></i>
                        </button>
                    </div>
                </div>
            </div>

            <p className='mt-2 text-light mx-4'>Main Menu</p>

            {/* เมนู Dashboard */}
            <Link to="/manager">
                <button
                    className={`btn mb-2 w-100 text-start ${activeMenu === '/manager' ? 'btn-light' : 'text-light'}`}
                    onClick={() => setActiveMenu('/manager')}
                >
                    <i className="bi bi-bar-chart-fill mx-3"></i>
                    DashBoard
                </button>
            </Link>

            {/* เมนู ประวัติงาน */}
            <Link to="/manager-record">
                <button
                    className={`btn mb-2 w-100 text-start ${activeMenu === '/manager-record' ? 'btn-light' : 'text-light'}`}
                    onClick={() => setActiveMenu('/manager-record')}
                >
                    <i className="bi bi-file-text-fill mx-3"></i>
                    ประวัติการทำงาน
                </button>
            </Link>

            {/* เมนู จัดการบัญชี */}
            <Link to="/manager-account">
                <button
                    className={`btn mb-2 w-100 text-start ${activeMenu === '/manager-account' ? 'btn-light' : 'text-light'}`}
                    onClick={() => setActiveMenu('/manager-account')}
                >
                    <i className="bi bi-person mx-3"></i>
                    จัดการบัญชีช่าง
                </button>
            </Link>

            {/* เมนู Setting (อยู่ด้านล่าง) */}
            <Link to="/manager-setting" >  
                <button
                    className={`btn ${activeMenu === '/manager-setting' ? 'btn-light' : 'text-light'}`}
                    style={{ position: 'absolute', bottom: '0.2rem', left: '0.3rem' }}
                    onClick={() => setActiveMenu('/manager-setting')}
                >
                    <i className="bi bi-gear"></i>
                </button>
            </Link>
        </div>
    )
}

export default ManagerNavbar