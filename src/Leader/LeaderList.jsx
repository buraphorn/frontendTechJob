import React, { useState } from "react";
import { employees } from "../data/dataCore.jsx"; // ตรวจสอบ path ให้ถูกต้องตามโครงสร้างโปรเจกต์ของคุณ
import { Form, InputGroup } from "react-bootstrap";

// --- Custom Styles ---
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600&display=swap');

  body {
    font-family: 'Kanit', sans-serif;
    background-color: #f8f9fd;
  }

  /* Search & Filter Styles */
  .search-input {
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    padding-left: 45px;
    background-color: #ffffff;
    transition: all 0.3s;
  }
  .search-input:focus {
    border-color: #4a4eb7;
    box-shadow: 0 0 0 4px rgba(74, 78, 183, 0.1);
  }
  .search-icon {
    position: absolute;
    left: 15px;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
    z-index: 10;
  }

  .custom-select {
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    cursor: pointer;
  }
  .custom-select:focus {
    border-color: #4a4eb7;
    box-shadow: 0 0 0 4px rgba(74, 78, 183, 0.1);
  }

  /* Card Styles */
  .tech-card {
    background: white;
    border-radius: 20px;
    border: 1px solid rgba(0,0,0,0.04);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
    position: relative;
  }

  .tech-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }

  .tech-card.active {
    border: 2px solid #4a4eb7;
    background-color: #fcfdff;
  }

  .avatar-circle {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    font-weight: 600;
    color: white;
    margin-bottom: 15px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  }

  .status-badge {
    position: absolute;
    top: 15px;
    right: 15px;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
  }

  .detail-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px dashed #e2e8f0;
    font-size: 0.9rem;
  }

  .info-item {
    display: flex;
    flex-direction: column;
  }
  .info-label {
    font-size: 0.75rem;
    color: #94a3b8;
  }
  .info-value {
    color: #334155;
    font-weight: 500;
  }
`;

const LeaderList = () => {
    const technicians = employees.filter((e) => e.role === "Technician");
    const [selectedId, setSelectedId] = useState(null);
    const [search, setSearch] = useState("");
    const [jobFilter, setJobFilter] = useState("");

    const allJobs = [...new Set(technicians.map((t) => t.job))];

    const filteredTechs = technicians.filter((t) => {
        const matchName = t.name.toLowerCase().includes(search.toLowerCase());
        const matchJob = jobFilter ? t.job === jobFilter : true;
        return matchName && matchJob;
    });

    // ฟังก์ชันเลือกสี Avatar ตามตัวอักษรแรก (เพื่อให้ดูมีสีสัน)
    const getAvatarColor = (char) => {
        const colors = ['#4a4eb7', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'];
        const index = char.charCodeAt(0) % colors.length;
        return colors[index];
    };

    // ฟังก์ชันเลือกสีสถานะ
    const getStatusStyle = (status) => {
        switch (status) {
            case "ว่าง": return { bg: "#dcfce7", text: "#166534" }; // เขียว
            case "กำลังทำงาน": return { bg: "#dbeafe", text: "#1e40af" }; // ฟ้า
            case "ลา": return { bg: "#fee2e2", text: "#991b1b" }; // แดง
            default: return { bg: "#f1f5f9", text: "#475569" }; // เทา
        }
    };

    return (
        <div style={{ width: "100%", minHeight: "100vh", marginLeft: "14rem", padding: "30px 40px", backgroundColor: "#f8f9fd" }}>
            <style>{styles}</style>

            {/* HEADER */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3">
                <div>
                    <h2 className="fw-bold mb-1" style={{ color: "#2c3e50" }}>
                        <i className="bi bi-people-fill me-2" style={{ color: "#4a4eb7" }}></i>
                        รายชื่อช่าง
                    </h2>
                </div>

                <div className="d-flex gap-3 flex-wrap">
                    {/* Filter */}
                    <Form.Select
                        className="custom-select shadow-sm"
                        value={jobFilter}
                        onChange={(e) => setJobFilter(e.target.value)}
                        style={{ width: "200px", padding: "10px 15px" }}
                    >
                        <option value="">📂 งานทั้งหมด</option>
                        {allJobs.map((job, index) => (
                            <option key={index} value={job}>{job}</option>
                        ))}
                    </Form.Select>

                    {/* Search */}
                    <div className="position-relative" style={{ width: "250px" }}>
                        <i className="bi bi-search search-icon"></i>
                        <input
                            type="text"
                            className="form-control search-input shadow-sm"
                            placeholder="ค้นหาชื่อช่าง..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ height: "45px" }}
                        />
                    </div>
                </div>
            </div>

            {/* GRID DISPLAY */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "25px",
                paddingBottom: "40px"
            }}>
                {filteredTechs.map((t) => {
                    const isSelected = selectedId === t.id;
                    const statusStyle = getStatusStyle(t.status);
                    const avatarBg = getAvatarColor(t.name);

                    return (
                        <div
                            key={t.id}
                            className={`tech-card p-4 d-flex flex-column align-items-center text-center ${isSelected ? 'active' : ''}`}
                            onClick={() => setSelectedId(isSelected ? null : t.id)}
                            style={{ cursor: "pointer", minHeight: isSelected ? "420px" : "260px" }}
                        >
                            {/* Status Badge */}
                            <span
                                className="status-badge"
                                style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
                            >
                                {t.status}
                            </span>

                            {/* Avatar */}
                            <div
                                className="avatar-circle"
                                style={{ background: `linear-gradient(135deg, ${avatarBg}, ${avatarBg}aa)` }}
                            >
                                {t.name.charAt(0)}
                            </div>

                            {/* Main Info */}
                            <h5 className="fw-bold mb-1" style={{ color: "#334155" }}>{t.name}</h5>
                            <span className="text-muted small mb-2 d-block">({t.nickname})</span>
                            <span className="badge bg-light text-secondary border px-3 py-2 rounded-pill">
                                {t.job}
                            </span>

                            {/* Expanded Details */}
                            {isSelected ? (
                                <div className="w-100 detail-grid text-start animate__animated animate__fadeIn">
                                    <div className="info-item">
                                        <span className="info-label"><i className="bi bi-telephone me-1"></i>เบอร์โทร</span>
                                        <span className="info-value">{t.phone}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label"><i className="bi bi-clock-history me-1"></i>อายุงาน</span>
                                        <span className="info-value">{t.workDuration}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label"><i className="bi bi-calendar-check me-1"></i>เริ่มงาน</span>
                                        <span className="info-value">{t.startDate}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label"><i className="bi bi-wallet2 me-1"></i>เงินเดือน</span>
                                        <span className="info-value">{t.salary.toLocaleString()}</span>
                                    </div>
                                    <div className="info-item col-span-2" style={{ gridColumn: "span 2" }}>
                                        <span className="info-label"><i className="bi bi-graph-up-arrow me-1"></i>รายได้รวม</span>
                                        <span className="info-value text-success">{t.income.toLocaleString()} บาท</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-auto pt-3 text-muted small opacity-50">
                                    <i className="bi bi-chevron-down"></i> คลิกเพื่อดูข้อมูล
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            
            {filteredTechs.length === 0 && (
                <div className="text-center py-5 text-muted">
                    <i className="bi bi-search fs-1 opacity-25"></i>
                    <p className="mt-3">ไม่พบรายชื่อช่างที่คุณค้นหา</p>
                </div>
            )}
        </div>
    );
};

export default LeaderList;