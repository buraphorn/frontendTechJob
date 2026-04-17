import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Search, Briefcase, ChevronRight, X, Calendar, Clock, Activity, MapPin } from 'lucide-react';

const ManagerAccount = () => {
    const [employees, setEmployees] = useState([]);
    const [allWorkHistory, setAllWorkHistory] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get('http://localhost:3000/api/manager/employees');
                setEmployees(res.data?.employees || []);
                setAllWorkHistory(res.data?.workHistory || []);
                setLoading(false);
            } catch (err) {
                console.error(err);
                // ถ้า API Error ให้เซ็ตเป็น Array ว่างจะได้ไม่พัง
                setEmployees([]);
                setAllWorkHistory([]);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSelectEmployee = (emp) => {
        console.log("Selected Employee:", emp); // เช็คใน Console ว่าข้อมูลมาครบไหม

        const history = allWorkHistory
            .filter(h => Number(h.technician_id) === Number(emp.id || emp.user_id))
            .map(h => ({
                id: h.work_id || h.id,
                jobTitle: h.job_name || h.namework,
                role: emp.role,
                location: h.location || 'ไม่ระบุ',
                date: (h.start_date || h.datework)
                    ? new Date(h.start_date || h.datework).toLocaleDateString('th-TH')
                    : '-'
            }));

        setSelectedEmployee({
            ...emp,
            jobHistory: history,
            workDuration: `${history.length} งานที่ทำเสร็จ`
        });
    };

    // ... ส่วนการ Render (เหมือนเดิมแต่เปลี่ยนการดึงข้อมูลพนักงานจาก filteredEmployees) ...
    const filteredEmployees = useMemo(() => {
        // เช็คก่อนว่ามีข้อมูลและเป็น Array จริงๆ ค่อย filter
        if (!employees || !Array.isArray(employees)) return [];

        return employees.filter(emp =>
            (emp.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (emp.nickname || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, employees]);

    if (loading) return <div className="p-5 ml-56">กำลังโหลดข้อมูลพนักงาน...</div>;

    return (
        <div style={{ marginLeft: '14rem', width: 'calc(100% - 14rem)' }} className="bg-light min-vh-100 p-5 font-sans">
            {/* Header & Search เหมือนเดิม */}
            <div className="row g-4">
                {filteredEmployees.map((emp) => (
                    <div key={emp.id} className="col-12 col-md-4 col-xl-3">
                        {/* เพิ่ม style cursor: pointer เพื่อให้รู้ว่ากดได้ และเพิ่ม hover effect */}
                        <div
                            className="card h-100 border-0 shadow-sm p-4 hover:shadow-md transition-all"
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleSelectEmployee(emp)}
                        >
                            <div className="text-center">
                                <div className="rounded-circle bg-primary text-white mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: 70, height: 70, fontSize: 24 }}>
                                    {emp.name ? emp.name.charAt(0) : '?'}
                                </div>
                                {/* นำชื่อเล่นกลับมาแสดงผล */}
                                <h5 className="fw-bold">
                                    {emp.name} {emp.nickname ? `(${emp.nickname})` : ''}
                                </h5>
                                <p className="text-muted small">{emp.role}</p>
                                <div className="text-primary small fw-bold d-flex align-items-center justify-content-center gap-1">
                                    ดูรายละเอียด <ChevronRight size={16} />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {/* Modal Detail เหมือนเดิม */}
            {selectedEmployee && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 d-flex align-items-center justify-content-center p-4">
                    <div className="bg-white rounded-4 shadow-lg w-100 max-w-2xl overflow-hidden">
                        <div className="p-4 border-bottom d-flex justify-content-between align-items-center bg-light">
                            <h5 className="mb-0 fw-bold">ประวัติการทำงาน: {selectedEmployee.name}</h5>
                            <button onClick={() => setSelectedEmployee(null)} className="btn btn-link text-dark p-0">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-4 overflow-auto" style={{ maxHeight: '70vh' }}>
                            {selectedEmployee.jobHistory.length > 0 ? (
                                <div className="list-group list-group-flush">
                                    {selectedEmployee.jobHistory.map(job => (
                                        <div key={job.id} className="list-group-item py-3 border-start border-4 border-primary mb-2 rounded shadow-sm">
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div>
                                                    <h6 className="fw-bold mb-1">{job.jobTitle}</h6>
                                                    <p className="text-muted small mb-0"><MapPin size={12} className="me-1" />{job.location}</p>
                                                </div>
                                                <span className="badge bg-light text-primary border">{job.date}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-5 text-muted">ยังไม่มีประวัติงานที่ทำเสร็จ</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagerAccount;