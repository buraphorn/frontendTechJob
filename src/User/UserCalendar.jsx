import React, { useState, useEffect } from 'react'
import { Calendar } from 'primereact/calendar'
import { Badge } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'

export default function UserCalendar({ tasks }) {
    const [selectedDate, setSelectedDate] = useState(null);
    const [workData, setWorkData] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const relevantWorks = tasks.filter(work =>
            work.status === "Assigned" ||
            work.status === "PendingInspection" ||
            work.status === "Rejected" || // <--- เพิ่มบรรทัดนี้ครับ (ตรวจสอบว่าในระบบใช้คำว่า "Rejected" หรือ "Revision")
            work.status === "Revision" || // <--- เผื่อไว้กรณีใช้คำว่า Revision ตาม AdminRecord
            work.completed === true
        );

        setWorkData(relevantWorks);
    }, [tasks]);

    const getTasksForDate = (date) => {
        if (!date) return [];
        return workData.filter(work => {
            if (!work.datework) return false;

            const wDate = new Date(work.datework);
            return wDate.toDateString() === date.toDateString();
        });
    };

    const dateTemplate = (date) => {
        const fullDate = new Date(date.year, date.month, date.day);
        const hasWork = getTasksForDate(fullDate).length > 0;
        return (
            <div style={{
                backgroundColor: hasWork ? '#fff3cd' : 'transparent',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {date.day}
            </div>
        );
    };

    const selectedTasks = getTasksForDate(selectedDate);

    // ฟังก์ชันกำหนดสถานะแสดงผล
    // UserCalendar.jsx

    // ฟังก์ชันกำหนดสถานะแสดงผล
    const getWorkStatusBadge = (work) => {
        if (work.completed) {
            return <Badge bg="success" className='rounded-pill'>✅ เสร็จสิ้น</Badge>;
        } else if (work.status === "PendingInspection" || (work.isSubmitted && work.status !== "Rejected" && work.status !== "Revision")) {
            return <Badge bg="warning" className='rounded-pill'>⏳ รอตรวจสอบ</Badge>;
        } else if (work.status === "Rejected" || work.status === "Revision") {
            // เพิ่มส่วนนี้: ถ้าโดนแก้ ให้ขึ้นสีแดง
            return <Badge bg="danger" className='rounded-pill'>❌ ให้แก้ไขงาน</Badge>;
        } else {
            return null; // หรือ Badge สำหรับ Assigned
        }
    };

    // ฟังก์ชันกำหนดสีขอบการ์ด
    const getCardBorderColor = (work) => {
        if (work.completed) {
            return '#10b981'; // เขียว
        } else if (work.status === "PendingInspection" || (work.isSubmitted && work.status !== "Rejected" && work.status !== "Revision")) {
            return '#f59e0b'; // ส้ม
        } else if (work.status === "Rejected" || work.status === "Revision") {
            return '#dc3545'; // <--- แดง (งานแก้)
        } else {
            return '#3b82f6'; // น้ำเงิน (งานปกติ)
        }
    };

    return (
        <div
            className="container-fluid py-5"
            style={{ minHeight: '100vh', background: '#F0F8FF', marginLeft: '14rem' }}
        >
            <div className='p-4'>

                <h1 className='fw-bolder mb-4 text-primary'>
                    <i className="bi bi-calendar-check me-3"></i>
                    ปฏิทินกิจกรรม
                </h1>
                <hr className='mb-4' />

                <div className='row'>
                    {/* คอลัมน์ปฏิทิน */}
                    <div className='col-lg-5 mb-4'>
                        <div className="card border-0 shadow-lg p-3">
                            <Calendar
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.value)}
                                inline
                                showIcon
                                dateTemplate={dateTemplate}
                                className="p-component w-100 prime-calendar-custom"
                            />
                        </div>
                    </div>

                    {/* คอลัมน์รายละเอียดงาน */}
                    <div className='col-lg-7'>
                        <div
                            className="p-4 border rounded-4 shadow-sm"
                            style={{ maxHeight: '80vh', overflowY: 'auto', background: 'white' }}>

                            <h4 className="mb-4 fw-bold text-dark">📋 รายละเอียดงาน</h4>

                            {selectedDate ? (
                                <>
                                    <div className="alert alert-primary bg-opacity-10 border-0 mb-4">
                                        <i className="bi bi-calendar-day-fill me-2"></i>
                                        <strong>วันที่เลือก: </strong>
                                        {selectedDate.toLocaleDateString('th-TH', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            weekday: 'long'
                                        })}
                                    </div>

                                    {selectedTasks.length > 0 ? (
                                        <div className="d-flex flex-column gap-3">
                                            {selectedTasks.map((work) => (
                                                <div
                                                    key={work.id}
                                                    className="card border-0 shadow-sm transition-hover"
                                                    style={{
                                                        borderLeft: `5px solid ${getCardBorderColor(work)}`,
                                                    }}
                                                >
                                                    <div className="card-body py-3 px-4">
                                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                                            <h5 className="card-title fw-semibold text-truncate mb-0" style={{ maxWidth: '70%' }}>
                                                                {work.namework}
                                                            </h5>
                                                            {getWorkStatusBadge(work)}
                                                        </div>

                                                        {work.detail && (
                                                            <p className="card-text text-muted small mb-2">
                                                                {work.detail}
                                                            </p>
                                                        )}

                                                        <div className="d-flex gap-4 text-secondary small mb-2">
                                                            {work.time && (
                                                                <span>
                                                                    <i className="bi bi-clock me-1"></i> {work.time}
                                                                </span>
                                                            )}
                                                            {work.datework && (
                                                                <span>
                                                                    {new Date(work.datework).toLocaleDateString('th-TH')}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* แสดงข้อความเพิ่มเติมถ้าส่งงานแล้ว */}
                                                        {(work.status === "PendingInspection" || work.isSubmitted) && !work.completed && (
                                                            <div className="alert alert-warning py-2 px-3 mb-2 small">
                                                                <i className="bi bi-info-circle me-2"></i>
                                                                งานนี้ถูกส่งไปตรวจสอบแล้ว กรุณารอหัวหน้าอนุมัติ
                                                            </div>
                                                        )}
                                                        {/* แสดงปุ่มเริ่มทำงานเฉพาะงานที่ยังไม่ส่ง หรือ งานที่ถูกตีกลับ (Rejected/Revision) */}
                                                        {!work.completed && work.status !== "PendingInspection" &&
                                                            ((!work.isSubmitted) || (work.status === "Rejected" || work.status === "Revision")) && (

                                                                <button
                                                                    className={`btn ${work.status === "Rejected" || work.status === "Revision" ? 'btn-danger' : 'btn-primary'}`}
                                                                    onClick={() => navigate('/sheetv2', { state: { work: work } })}
                                                                >
                                                                    {/* เปลี่ยนข้อความปุ่มตามสถานะ */}
                                                                    {(work.status === "Rejected" || work.status === "Revision") ? "แก้ไขงานส่งใหม่" : "เริ่มทำงาน"}
                                                                </button>
                                                            )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-5">
                                            <div style={{ fontSize: '3rem', color: '#6c757d' }}>🎉</div>
                                            <p className="text-muted mt-3 fw-light">ไม่มีงานในวันนี้! สนุกกับวันว่างของคุณ</p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-5">
                                    <div style={{ fontSize: '3rem', color: '#6c757d' }}>👆</div>
                                    <p className="text-muted mt-3 fw-light">กรุณาเลือกวันที่จากปฏิทินเพื่อดูรายละเอียดงาน</p>
                                </div>
                            )}
                        </div>

                        {/* สรุปงานทั้งหมด */}
                        <div className="mt-4 pt-3">
                            <h6 className="text-muted mb-3 fw-bold">📊 สรุปภาพรวม</h6>
                            <div className="row g-3">
                                <div className="col-sm-6 col-md-3">
                                    <SummaryCard
                                        count={workData.length}
                                        title="งานทั้งหมด"
                                        color="primary"
                                        icon="list-task"
                                    />
                                </div>
                                <div className="col-sm-6 col-md-3">
                                    <SummaryCard
                                        count={workData.filter(w => w.completed).length}
                                        title="เสร็จสิ้น"
                                        color="success"
                                        icon="check-circle-fill"
                                    />
                                </div>
                                <div className="col-sm-6 col-md-3">
                                    <SummaryCard
                                        count={workData.filter(w => !w.completed && w.status !== "PendingInspection").length}
                                        title="รอดำเนินการ"
                                        color="info"
                                        icon="hourglass-split"
                                    />
                                </div>
                                <div className="col-sm-6 col-md-3">
                                    <SummaryCard
                                        count={workData.filter(w => w.status === "PendingInspection" || w.isSubmitted).length}
                                        title="รอตรวจสอบ"
                                        color="warning"
                                        icon="clock-history"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

const SummaryCard = ({ count, title, color, icon }) => {
    return (
        <div className={`card border-0 shadow-sm bg-${color} bg-opacity-10`}>
            <div className="card-body text-center p-3">
                <div className={`h4 mb-1 fw-bold text-${color}`}>
                    <i className={`bi bi-${icon} me-1`}></i>
                    {count}
                </div>
                <small className="text-muted">{title}</small>
            </div>
        </div>
    );
};