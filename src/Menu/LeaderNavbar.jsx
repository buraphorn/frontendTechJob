import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import "bootstrap-icons/font/bootstrap-icons.css";

const leaderNavbar = ({ onLogout }) => {
    const location = useLocation()
    const [activeMenu, setActiveMenu] = useState(location.pathname)
    const navigate = useNavigate()

    useEffect(() => {
        setActiveMenu(location.pathname)
    }, [location.pathname])

    const handleLogout = () => {
        if (onLogout) {
            onLogout()
        }
        navigate('/login')
    }

    const getButtonClass = (path) => {
        return `btn mb-2 w-100 ${activeMenu === path ? 'bg-white text-dark' : 'text-light'}`
    }

    return (
        <div className="border-1 bg-primary" style={{ width: '14rem', position: 'fixed', height: '100vh'}}>
            <div className="d-flex align-items-center justify-content-between border-1 m-3 border-light px-2 py-2 btn btn-outline-danger" style={{ borderRadius: '30px' }}
                onClick={handleLogout}>
                <div>
                    <span className='text-light ml-4'>Logout</span>
                </div>
                <div>
                    <button>
                        <i className="bi bi-box-arrow-right text-light"></i>
                    </button>
                </div>
            </div>

            <p className='mt-2 text-light mx-4'>Main Menu</p>

            <Link to="/leader">
                <button
                    className={getButtonClass('/leader')}
                    onClick={() => setActiveMenu('/leader')}
                >
                    หน้าหลัก
                </button>
            </Link>

            <Link to="/leader-list">
                <button
                    className={getButtonClass('/leader-list')}
                    onClick={() => setActiveMenu('/leader-list')}
                >
                    รายชื่อ
                </button>
            </Link>

            <Link to="/leader-setting">
                <button
                    className={`btn  ${activeMenu === '/leader-setting' ? 'btn-light' : 'text-light'}`} style={{ position: 'absolute', bottom: '0.2rem', left: '0.3rem',borderRadius:"90px" }}
                    onClick={() => setActiveMenu('/leader-setting')}
                >
                    <i className="bi bi-gear" style={{ fontSize: "30px" }}></i>
                </button>
            </Link>
        </div>
    )
}

export default leaderNavbar