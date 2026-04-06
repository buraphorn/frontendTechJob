import React, { useState, useMemo, useEffect } from 'react';
import { Search, User, X, Calendar, Clock, Activity, Briefcase, MapPin, ChevronRight } from 'lucide-react';
// import getEmployeeWithHistory ออก เพราะเราจะสร้าง History เองจาก tasks
import { getAllEmployees } from '../data/dataCore';

// รับ prop tasks (ข้อมูลงานทั้งหมด) เข้ามาเพื่อใช้สร้างประวัติการทำงาน
const ManagerAccount = ({ tasks }) => {
    // --- ตัวแปรเก็บสถานะ (State) ---
    const [employees, setEmployees] = useState([]); // รายชื่อพนักงานทั้งหมด
    const [searchTerm, setSearchTerm] = useState(''); // คำค้นหา
    const [selectedEmployee, setSelectedEmployee] = useState(null); // พนักงานที่ถูกเลือกดูรายละเอียด

    // เริ่มทำงานเมื่อเปิดหน้าเว็บ: ดึงข้อมูลพนักงาน
    useEffect(() => {
        const allEmp = getAllEmployees();
        setEmployees(allEmp);
    }, []);

    // --- ระบบค้นหา (Search Logic) ---
    // กรองรายชื่อตามคำที่พิมพ์ (ชื่อ หรือ ชื่อเล่น)
    const filteredEmployees = useMemo(() => {
        return employees.filter(emp => {
            const name = (emp.name || '').toLowerCase();
            const nickname = (emp.nickname || '').toLowerCase();
            const search = searchTerm.toLowerCase();
            return name.includes(search) || nickname.includes(search);
        });
    }, [searchTerm, employees]);

    // --- ฟังก์ชันหลัก: เมื่อคลิกเลือกพนักงาน ---
    const handleSelectEmployee = (emp) => {
        // 1. ไปกวาดหา Tasks ทั้งหมดที่พนักงานคนนี้เป็นคนทำ (เช็คจากชื่อ technicianName)
        const empTasks = tasks.filter(t => t.technicianName === emp.name && t.status !== 'Draft');

        // 2. แปลง Tasks ที่เจอ เป็นรูปแบบประวัติงาน (History Format)
        const jobHistory = empTasks.map(t => ({
            id: t.id,
            jobTitle: t.namework,
            role: 'ช่างปฏิบัติงาน', // หรือดึงจาก t.typework
            location: t.location?.address || t.role || 'ไม่ระบุ',
            date: new Date(t.datework || Date.now()).toLocaleDateString('th-TH')
        }));

        // 3. รวมข้อมูลพื้นฐาน + ประวัติงานที่สร้างใหม่ แล้วเปิด Modal
        const fullData = {
            ...emp,
            jobHistory: jobHistory,
            // คำนวณสรุปจำนวนงานที่ทำเสร็จ
            workDuration: `${jobHistory.length} งานที่ทำเสร็จ`
        };

        setSelectedEmployee(fullData);
    };

    // ฟังก์ชันช่วย: เลือกสีพื้นหลังรูปโปรไฟล์ตามชื่อ
    const getAvatarColor = (char) => {
        const colors = ['#4a4eb7', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'];
        const index = (char ? char.charCodeAt(0) : 0) % colors.length;
        return colors[index];
    };

    // ฟังก์ชันช่วย: คำนวณอายุจากวันเกิด
    const calculateAge = (dob) => {
        if (!dob) return "-";
        const diff = Date.now() - new Date(dob).getTime();
        return Math.abs(new Date(diff).getUTCFullYear() - 1970);
    };

    return (
        <div
            style={{ marginLeft: '14rem', width: 'calc(100% - 14rem)' }}
            className="bg-light min-vh-100 p-4 p-md-5 font-sans"
        >
            {/* --- ส่วนหัว Header และช่องค้นหา --- */}
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-5 gap-3">
                <div>
                    <h2 className="fw-bold text-dark d-flex align-items-center gap-2 m-0">
                        <Briefcase size={28} style={{ color: '#4a4eb7' }} />
                        บัญชีผู้ใช้งาน (Accounts)
                    </h2>
                    <p className="text-muted small mt-1 mb-0">
                        จัดการข้อมูลพนักงานและประวัติการทำงานทั้งหมด
                    </p>
                </div>
                {/* Search Bar */}
                <div className="position-relative" style={{ width: '100%', maxWidth: '350px' }}>
                    <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" size={20} />
                    <input
                        type="text"
                        className="form-control form-control-lg ps-5 border-0 shadow-sm rounded-pill"
                        placeholder="ค้นหาชื่อ หรือ ชื่อเล่น..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ fontSize: '0.95rem' }}
                    />
                </div>
            </div>

            {/* --- แสดงรายการการ์ดพนักงาน --- */}
            <div className="row g-4 pb-5 w-100 m-0">
                {filteredEmployees.map((emp) => {
                    const avatarBg = getAvatarColor(emp.name);
                    return (
                        <div key={emp.id} className="col-12 col-sm-6 col-lg-4 col-xl-3">
                            <div
                                className="card h-100 border-0 shadow-sm text-center p-4 cursor-pointer transition-all position-relative overflow-hidden"
                                onClick={() => handleSelectEmployee(emp)}
                                style={{ borderRadius: '20px', transition: 'transform 0.2s' }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-20px)';
                                    e.currentTarget.style.boxShadow = '0 .5rem 1rem rgba(0,0,0,.15)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 .125rem .25rem rgba(0,0,0,.075)';
                                }}
                            >
                                <div className="card-body d-flex flex-column align-items-center p-0">
                                    <div
                                        className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm mb-3"
                                        style={{
                                            width: '85px', height: '85px', fontSize: '32px',
                                            background: `linear-gradient(135deg, ${avatarBg}, ${avatarBg}aa)`,
                                            border: '4px solid white',
                                            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                                        }}
                                    >
                                        {emp.name.charAt(0)}
                                    </div>
                                    <h5 className="fw-bold text-dark mb-1 text-nowrap" style={{ fontSize: '1.2rem' }}>
                                        {emp.name}
                                    </h5>
                                    <span className="text-secondary small mb-3">({emp.nickname})</span>
                                    <span className="badge bg-light text-secondary border rounded-pill px-4 py-2 fw-normal mt-auto w-auto">
                                        {emp.role === 'Technician' ? 'ช่างเทคนิค' : emp.role}
                                    </span>
                                    <div className="mt-4 text-primary small d-flex align-items-center fw-bold" style={{ color: '#4a4eb7' }}>
                                        ดูรายละเอียด <ChevronRight size={18} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* --- Modal แสดงรายละเอียดพนักงาน (จะแสดงเมื่อ selectedEmployee ไม่ใช่ null) --- */}
            {selectedEmployee && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 z-3 d-flex align-items-center justify-content-center p-3"
                    style={{ backdropFilter: 'blur(4px)', zIndex: 1050 }}
                >
                    <div
                        className="bg-white w-100 overflow-hidden shadow-lg animate-in fade-in zoom-in-95 duration-200"
                        style={{ maxWidth: '800px', borderRadius: '24px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
                    >
                        {/* Modal Header */}
                        <div className="p-4 d-flex justify-content-between align-items-start text-white" style={{ backgroundColor: '#4a4eb7' }}>
                            <div className="d-flex align-items-center gap-3">
                                <div className="rounded-circle bg-white bg-opacity-25 d-flex align-items-center justify-content-center fw-bold"
                                    style={{ width: '60px', height: '60px', fontSize: '24px' }}>
                                    {selectedEmployee.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="m-0 fw-bold">{selectedEmployee.name}</h4>
                                    <div className="small opacity-75 mt-1">
                                        ชื่อเล่น: {selectedEmployee.nickname} • อายุ: {selectedEmployee.age || calculateAge(selectedEmployee.dob)} ปี
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setSelectedEmployee(null)} className="btn btn-link text-white p-1 rounded-circle">
                                <X size={28} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-4 overflow-auto bg-white">
                            <div className="row g-3 mb-4">
                                <InfoCard icon={<Calendar size={20} />} color="primary" label="วันเดือนปีเกิด" value={selectedEmployee.dob || "-"} />
                                <InfoCard icon={<Clock size={20} />} color="success" label="ผลงานทั้งหมด" value={selectedEmployee.workDuration || "-"} />
                                <InfoCard icon={<Activity size={20} />} color="danger" label="โรคประจำตัว" value={selectedEmployee.disease || "ไม่มี"} />
                            </div>

                            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: '#334155' }}>
                                <Briefcase size={20} style={{ color: '#4a4eb7' }} />
                                ประวัติหน้าที่ (Job History)
                            </h5>

                            {/* ตารางแสดงประวัติงาน */}
                            <div className="table-responsive border rounded-4 overflow-hidden">
                                <table className="table table-hover mb-0 align-middle">
                                    <thead className="table-light text-secondary small">
                                        <tr>
                                            <th className="p-3 border-bottom">ชื่องาน / โปรเจกต์</th>
                                            <th className="p-3 border-bottom">ตำแหน่ง</th>
                                            <th className="p-3 border-bottom">สถานที่</th>
                                            <th className="p-3 border-bottom text-end">วันที่</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedEmployee.jobHistory && selectedEmployee.jobHistory.length > 0 ? (
                                            selectedEmployee.jobHistory.map((job) => (
                                                <tr key={job.id}>
                                                    <td className="p-3 fw-medium text-dark">{job.jobTitle}</td>
                                                    <td className="p-3">
                                                        <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-pill fw-normal">
                                                            {job.role}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 text-secondary small">
                                                        <div className="d-flex align-items-center gap-1">
                                                            <MapPin size={14} /> {job.location}
                                                        </div>
                                                    </td>
                                                    <td className="p-3 text-end text-muted small font-monospace">
                                                        {job.date}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="text-center p-5 text-muted">
                                                    ยังไม่มีประวัติการทำงาน
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Component ย่อย: การ์ดแสดงข้อมูลเล็กๆ
const InfoCard = ({ icon, color, label, value }) => {
    const bgClass = `bg-${color} bg-opacity-10 text-${color}`;
    return (
        <div className="col-12 col-md-4">
            <div className="border rounded-4 p-3 d-flex align-items-center gap-3 shadow-sm h-100">
                <div className={`p-2 rounded-3 ${bgClass}`}>
                    {icon}
                </div>
                <div>
                    <div className="small text-secondary">{label}</div>
                    <div className="fw-bold text-dark">{value}</div>
                </div>
            </div>
        </div>
    );
};

export default ManagerAccount;