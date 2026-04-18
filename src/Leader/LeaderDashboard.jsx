import React, { useState, useEffect, useMemo } from "react";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
    ResponsiveContainer, CartesianGrid
} from "recharts";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Form } from "react-bootstrap";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600&display=swap');
  
  body {
    font-family: 'Kanit', sans-serif;
    background-color: #f8f9fd;
  }

  .glass-card {
    background: #ffffff;
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.5);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .hover-lift:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(74, 78, 183, 0.15);
  }

  .work-item {
    transition: all 0.2s ease;
    border-left: 4px solid transparent;
  }

  .work-item:hover {
    background-color: #f8f9ff !important;
  }

  .work-item.active {
    background-color: #f0f4ff !important;
    border-left: 4px solid #4a4eb7;
  }

  .custom-badge {
    padding: 5px 12px;
    border-radius: 30px;
    font-size: 0.8rem;
    font-weight: 500;
  }
  
  .btn-gradient {
    background: linear-gradient(135deg, #4a4eb7 0%, #6c71e0 100%);
    border: none;
    color: white;
    box-shadow: 0 4px 15px rgba(74, 78, 183, 0.3);
    transition: all 0.3s;
  }
  
  .btn-gradient:hover {
    background: linear-gradient(135deg, #3d4199 0%, #5a5fc2 100%);
    box-shadow: 0 6px 20px rgba(74, 78, 183, 0.4);
    transform: translateY(-2px);
  }

  /* Custom Scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
  }
  ::-webkit-scrollbar-track {
    background: #f1f1f1; 
    border-radius: 10px;
  }
  ::-webkit-scrollbar-thumb {
    background: #c1c1c1; 
    border-radius: 10px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8; 
  }
`;

const LeaderDashboard = ({ tasks, setTasks }) => {
    const [technicians, setTechnicians] = useState([]);
    const [selectedWork, setSelectedWork] = useState(null);
    const [assignTechs, setAssignTechs] = useState([]); // เปลี่ยนมาเก็บเป็น Array เพื่อเลือกได้หลายคน
    const [showModal, setShowModal] = useState(false);
    const [selectedTech, setSelectedTech] = useState(null);

    const navigate = useNavigate();
    const goCheckWork = () => navigate("/leader-work");
    const goReport = () => navigate("/leader-report");

    useEffect(() => {
        fetch("http://localhost:3000/technicians")  // หรือ port ที่ใช้จริง
            .then(res => res.json())
            .then(data => setTechnicians(data.technicians))
            .catch(err => console.error("Error fetching technicians:", err));
    }, []);

    const handleClose = () => setShowModal(false);

    // ฟังก์ชันสำหรับจัดการการเลือกช่าง (Toggle Checkbox)
    const handleTechToggle = (techName) => {
        setAssignTechs(prev =>
            prev.includes(techName)
                ? prev.filter(name => name !== techName) // เอาออกถ้ามีอยู่แล้ว
                : [...prev, techName] // เพิ่มเข้าไปถ้ายังไม่มี
        );
    };

    // ==========================================
    // ส่วน Logic แผนที่ (Map Logic) ที่ปรับปรุงแล้ว
    // ==========================================
    const currentMapLocation = useMemo(() => {
        if (selectedWork && selectedWork.location && selectedWork.location.lat) {
            return {
                lat: selectedWork.location.lat,
                lng: selectedWork.location.lng,
                name: selectedWork.namework,
                role: selectedWork.role,
                tech: selectedWork.technicianName || "กำลังเลือกช่าง..."
            };
        }

        const activeWork = tasks.find(w =>
            ['Assigned', 'PendingInspection'].includes(w.status) && w.location && w.location.lat
        );

        if (activeWork) {
            return {
                lat: activeWork.location.lat,
                lng: activeWork.location.lng,
                name: activeWork.namework,
                role: activeWork.role,
                tech: activeWork.technicianName
            };
        }

        const latestWork = tasks.find(w => w.location && w.location.lat);
        if (latestWork) {
            return {
                lat: latestWork.location.lat,
                lng: latestWork.location.lng,
                name: latestWork.namework,
                role: latestWork.role,
                tech: "รอจ่ายงาน"
            };
        }

        return {
            lat: 13.7563,
            lng: 100.5018,
            name: "Main Office",
            role: "Bangkok HQ",
            tech: "-"
        };
    }, [tasks, selectedWork]);

    const employeeStats = technicians.map((t) => ({
        name: t.nickname ?? t.name,
        completed: t.status === "ว่าง" ? 1 : 0,
        inProgress: t.status === "กำลังทำงาน" ? 1 : 0,
        overdue: t.status === "ลา" ? 1 : 0,
    }));

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Completed': return 'bg-success text-white';
            case 'Pending': return 'bg-warning text-dark bg-opacity-75';
            case 'Assigned': return 'bg-primary text-white';
            case 'PendingInspection': return 'bg-info text-dark';
            default: return 'bg-secondary text-white';
        }
    };

    return (
        <div style={{ width: "100%", padding: "30px 50px", marginLeft: "14rem", minHeight: "100vh", backgroundColor: "#f8f9fd" }}>
            <style>{styles}</style>

            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h2 className="fw-bold mb-1" style={{ color: "#2c3e50" }}>Leader Dashboard</h2>
                </div>
                <div className="glass-card px-3 py-2 d-flex align-items-center" style={{ cursor: "pointer" }}>
                    <div className="position-relative">
                        <i className="bi bi-bell-fill" style={{ fontSize: "22px", color: "#4a4eb7" }}></i>
                        <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
                            <span className="visually-hidden">New alerts</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* SUMMARY CARDS */}
            <div className="row g-4 mb-5">
                {[
                    {
                        title: "งานวันนี้",
                        count: tasks.length,
                        color: "#4a6ff0",
                        icon: "bi-calendar-check"
                    },
                    {
                        title: "รอจ่ายงาน",
                        count: tasks.filter(w => w.status === "Pending").length,
                        color: "#f39c12",
                        icon: "bi-hourglass-split"
                    },
                    {
                        title: "รอตรวจงาน",
                        count: tasks.filter(w => w.status === "PendingInspection").length,
                        color: "#dc3545",
                        icon: "bi-search"
                    },
                    {
                        title: "กำลังดำเนินการ",
                        count: tasks.filter(w => w.status === "Assigned").length,
                        color: "#00c0ef",
                        icon: "bi-tools"
                    },
                ].map((item, i) => (
                    <div className="col-12 col-md-3" key={i}>
                        <div className="glass-card hover-lift p-4 h-100 position-relative overflow-hidden">
                            <div className="d-flex justify-content-between align-items-start z-1 position-relative">
                                <div>
                                    <p className="text-muted mb-1 fw-medium">{item.title}</p>
                                    <h2 className="fw-bold mb-0" style={{ color: "#2c3e50" }}>{item.count}</h2>
                                </div>
                                <div className="rounded-4 d-flex align-items-center justify-content-center"
                                    style={{ width: "50px", height: "50px", background: `${item.color}20`, color: item.color }}>
                                    <i className={`bi ${item.icon}`} style={{ fontSize: "24px" }}></i>
                                </div>
                            </div>
                            <div className="position-absolute"
                                style={{ width: "100px", height: "100px", background: item.color, borderRadius: "50%", opacity: "0.05", right: "-20px", bottom: "-20px" }}>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* MAIN ACTIONS */}
            <div className="row g-4 mb-5">
                <div className="col-6">
                    <div className="glass-card hover-lift p-4 text-center h-100 d-flex flex-column justify-content-center align-items-center"
                        style={{ cursor: "pointer", borderBottom: "5px solid #4a4eb7" }}
                        onClick={goCheckWork}>
                        <div className="mb-3 p-3 rounded-circle bg-light">
                            <i className="bi bi-clipboard-check-fill" style={{ fontSize: 40, color: "#4a4eb7" }}></i>
                        </div>
                        <h4 className="fw-bold mb-1">ตรวจงาน</h4>
                        <small className="text-muted">อนุมัติและตรวจสอบงานช่าง</small>
                    </div>
                </div>
                <div className="col-6">
                    <div className="glass-card hover-lift p-4 text-center h-100 d-flex flex-column justify-content-center align-items-center"
                        style={{ cursor: "pointer", borderBottom: "5px solid #ff5a5a" }}
                        onClick={goReport}>
                        <div className="mb-3 p-3 rounded-circle bg-light">
                            <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: 40, color: "#ff5a5a" }}></i>
                        </div>
                        <h4 className="fw-bold mb-1">รายงานปัญหา</h4>
                        <small className="text-muted">ดูรายการแจ้งปัญหาและข้อร้องเรียน</small>
                    </div>
                </div>
            </div>

            {/* WORK ASSIGNMENT SECTION */}
            <div className="row g-4 mb-5">
                {/* List Column */}
                <div className="col-lg-7">
                    <div className="glass-card p-4 h-100">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="fw-bold m-0" style={{ color: "#4a4eb7" }}>
                                <i className="bi bi-list-task me-2"></i>รายการงานทั้งหมด
                            </h5>
                            <span className="badge bg-light text-dark border">{tasks.length} งาน</span>
                        </div>

                        <div style={{ height: "500px", overflowY: "auto", paddingRight: "5px" }}>
                            <ul className="list-group border-0">
                                {tasks.length > 0 ? (
                                    tasks.map(task => (
                                        <li key={task.id}
                                            className={`list-group-item border-0 rounded-3 mb-2 px-3 py-3 shadow-sm work-item ${selectedWork?.id === task.id ? 'active' : ''}`}
                                            style={{ cursor: "pointer", backgroundColor: "#fff" }}
                                            onClick={() => {
                                                setSelectedWork(task);
                                                setAssignTechs([]); // เคลียร์รายชื่อช่างเมื่อเปลี่ยนงาน
                                            }}>
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <div className="fw-bold text-dark">{task.namework}</div>
                                                <span className={`badge rounded-pill ${getStatusBadge(task.status || 'Pending')}`}>
                                                    {task.status || 'Pending'}
                                                </span>
                                            </div>
                                            <small className="text-muted d-block text-truncate">{task.detail}</small>
                                        </li>
                                    ))
                                ) : (
                                    <div className="text-center text-muted mt-5">ไม่มีงานที่ได้รับมอบหมาย</div>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Detail Column */}
                <div className="col-lg-5">
                    <div className="glass-card p-4 h-100 d-flex flex-column">
                        <h5 className="fw-bold mb-4" style={{ color: "#4a4eb7" }}>
                            <i className="bi bi-card-text me-2"></i>รายละเอียดงาน
                        </h5>

                        {selectedWork ? (
                            <div className="d-flex flex-column h-100">
                                <div className="flex-grow-1">
                                    <div className="mb-4">
                                        <h5 className="fw-bold mb-3">{selectedWork.namework}</h5>
                                        <div className="row g-3">
                                            <div className="col-6">
                                                <small className="text-muted d-block">ประเภทงาน</small>
                                                <span className="fw-medium">{selectedWork.typework}</span>
                                            </div>
                                            <div className="col-6">
                                                <small className="text-muted d-block">เวลา</small>
                                                <span className="fw-medium">{selectedWork.time}</span>
                                            </div>
                                            <div className="col-12">
                                                <small className="text-muted d-block">สถานที่/เบอร์โทร</small>
                                                <span className="fw-medium"><i className="bi bi-geo-alt me-1 text-danger"></i>{selectedWork.role}</span>
                                            </div>
                                        </div>

                                        <div className="mt-3 p-3 bg-light rounded-3 border">
                                            <small className="text-muted fw-bold">รายละเอียดเพิ่มเติม:</small>
                                            <p className="mb-0 mt-1 small text-secondary">{selectedWork.detail}</p>
                                        </div>
                                    </div>

                                    <hr className="my-4 text-muted opacity-25" />

                                    <div className="mb-3">
                                        <label className="form-label fw-bold small text-uppercase text-muted">มอบหมายช่าง (เลือกได้หลายคน)</label>

                                        <div className="border rounded-3 p-2 bg-white shadow-sm" style={{ maxHeight: '180px', overflowY: 'auto', borderColor: '#dee2e6' }}>
                                            {technicians.map(emp => (
                                                <div key={emp.id || emp.technician_id} className="form-check mb-2">
                                                    <input
                                                        className="form-check-input shadow-none"
                                                        type="checkbox"
                                                        id={`tech-${emp.id || emp.technician_id}`}
                                                        value={emp.name}
                                                        checked={assignTechs.includes(emp.name)}
                                                        onChange={() => handleTechToggle(emp.name)}
                                                        disabled={emp.status === "ลา"}
                                                        style={{ cursor: emp.status === "ลา" ? "not-allowed" : "pointer", borderColor: '#adb5bd' }}
                                                    />
                                                    <label
                                                        className="form-check-label w-100"
                                                        htmlFor={`tech-${emp.id || emp.technician_id}`}
                                                        style={{
                                                            color: emp.status === "ลา" ? "#dc3545" : "#212529",
                                                            cursor: emp.status === "ลา" ? "not-allowed" : "pointer"
                                                        }}
                                                    >
                                                        {emp.name} {emp.nickname ? `(${emp.nickname})` : ''}
                                                        <span className="text-muted ms-1" style={{ fontSize: '0.85em' }}>
                                                            - {emp.typework || emp.type} {emp.status === "ลา" ? '(ลา)' : ''}
                                                        </span>
                                                    </label>
                                                </div>
                                            ))}
                                            {technicians.length === 0 && <div className="text-muted small p-2">ไม่มีข้อมูลช่าง</div>}
                                        </div>
                                    </div>

                                    {/* แสดงข้อมูลสรุปช่างที่ถูกเลือกทั้งหมด */}
                                    {assignTechs.length > 0 && (
                                        <div className="alert alert-primary border-0 bg-primary bg-opacity-10 py-2 px-3 mb-3 small rounded-3">
                                            <div className="d-flex align-items-center mb-2">
                                                <i className="bi bi-people-fill me-2 text-primary"></i>
                                                <span className="fw-bold text-primary">ทีมช่างที่เลือก ({assignTechs.length} คน)</span>
                                            </div>
                                            <div className="mt-1 ps-4 text-dark">
                                                {assignTechs.map(name => {
                                                    const tech = technicians.find(e => e.name === name);
                                                    return (
                                                        <div key={name} className="mb-1">
                                                            • {name} <span className="text-muted">({tech?.typework || tech?.type || 'ไม่ระบุ'})</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <Button
                                    disabled={assignTechs.length === 0}
                                    onClick={() => {
                                        const updatedTasks = tasks.map(t => {
                                            if (t.id === selectedWork.id) {
                                                return {
                                                    ...t,
                                                    technicianName: assignTechs.join(", "), // เชื่อมชื่อช่างทุกคนด้วยลูกน้ำ
                                                    assignedTechsArray: assignTechs, // เก็บค่าเป็น Array ไว้ใช้งาน
                                                    status: "Assigned",
                                                    datework: t.datework || new Date().toISOString()
                                                };
                                            }
                                            return t;
                                        });
                                        setTasks(updatedTasks);
                                        alert(`มอบหมายงาน ${selectedWork.namework} ให้ทีมช่าง ${assignTechs.length} คน เรียบร้อยแล้ว`);
                                        setAssignTechs([]);
                                        setSelectedWork(null);
                                    }}
                                    className="w-100 rounded-3 py-2 btn-gradient fw-bold mt-auto"
                                >
                                    <i className="bi bi-send-check-fill me-2"></i>ยืนยันส่งงาน
                                </Button>
                            </div>
                        ) : (
                            <div className="text-center text-muted my-auto opacity-50">
                                <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                                <p>กรุณาเลือกงานจากรายการด้านซ้าย<br />เพื่อดูรายละเอียด</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ส่วนแสดงแผนที่ */}
                <div className="col-12">
                    <div className="glass-card p-4 mb-5">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <h5 className="fw-bold m-0" style={{ color: "#4a4eb7" }}>
                                    <i className="bi bi-geo-alt-fill me-2 text-danger"></i>ติดตามตำแหน่งงาน
                                </h5>
                                <div className="mt-1">
                                    <small className="text-muted"><i className="bi bi-pin-map me-1"></i>สถานที่: {currentMapLocation.name}</small>
                                    <small className="text-muted ms-3"><i className="bi bi-person me-1"></i>ผู้รับผิดชอบ: {currentMapLocation.tech}</small>
                                </div>
                            </div>
                            <span className="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill">
                                <i className="bi bi-circle-fill small me-2"></i>Live Location
                            </span>
                        </div>

                        <div className="rounded-4 overflow-hidden shadow-sm border bg-light">
                            <iframe
                                title="Location Map"
                                width="100%"
                                height="500"
                                style={{ border: 0, display: 'block' }}
                                loading="lazy"
                                allowFullScreen
                                src={`https://maps.google.com/maps?q=${currentMapLocation.lat},${currentMapLocation.lng}&hl=th&z=15&output=embed`}>
                            </iframe>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default LeaderDashboard;