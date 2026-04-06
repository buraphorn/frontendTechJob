import React, { useState, useEffect } from 'react'
import { Badge } from 'react-bootstrap'

// รับ props 'tasks' เข้ามา
const UserWorkSheet = ({ tasks = [] }) => {
    const [filteredData, setFilteredData] = useState([])
    const [searchTerm, setSearchTerm] = useState('')

    // เมื่อ tasks เปลี่ยนแปลง ให้โหลดข้อมูลใหม่
    useEffect(() => {
        // ในสถานการณ์จริงอาจจะ filter เฉพาะงานของ user ที่ login อยู่
        // แต่ในที่นี้เราแสดงทั้งหมด หรือ filter ตามชื่อช่างก็ได้
        setFilteredData(tasks);
    }, [tasks]);

    const handleSearch = () => {
        if (!searchTerm.trim()) { setFilteredData(tasks); return; }
        const lowerSearch = searchTerm.toLowerCase();
        const filtered = tasks.filter(work =>
            (work.id && work.id.toLowerCase().includes(lowerSearch)) ||
            (work.namework && work.namework.toLowerCase().includes(lowerSearch))
        );
        setFilteredData(filtered);
    }

    useEffect(() => { handleSearch() }, [searchTerm]);

    // ฟังก์ชันแสดงป้ายสถานะ (Update ให้ครบทุกสถานะ)
    const getStatusBadge = (status) => {
        switch (status) {
            case 'Assigned': return <Badge bg="primary">ได้รับมอบหมาย</Badge>;
            case 'Pending': return <Badge bg="info" text="dark">รอรับงาน</Badge>;
            case 'PendingInspection': return <Badge bg="warning" text="dark">รอหัวหน้าตรวจสอบ</Badge>; // สถานะใหม่
            case 'Approved': return <Badge bg="success">อนุมัติแล้ว</Badge>; // สถานะเมื่อเสร็จสิ้น
            case 'Revision': return <Badge bg="danger">ต้องแก้ไขงาน</Badge>; // สถานะเมื่อโดน Reject
            default: return <Badge bg="secondary">{status || 'Draft'}</Badge>;
        }
    };

    return (
        <div className="container-fluid py-5" style={{ minHeight: '100vh', background: '#F0F8FF', marginLeft: '14rem' }}>
            <div className='container p-4 p-md-5 rounded-4'>
                <h1 className='fw-bold mb-4 text-primary'><i className="bi bi-card-list me-3"></i>ประวัติใบงานของฉัน</h1>
                <div className="d-flex mb-4">
                    <input className="form-control" type="text" placeholder="ค้นหา..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="shadow-sm rounded-3 overflow-hidden border bg-white">
                    <table className="table table-hover table-striped mb-0">
                        <thead className="table-primary text-white">
                            <tr><th>รหัส</th><th>ชื่องาน</th><th>รายละเอียด</th><th>วันที่ทำรายการ</th><th>สถานะ</th></tr>
                        </thead>
                        <tbody>
                            {filteredData.length > 0 ? filteredData.map(work => (
                                <tr key={work.id}>
                                    <td className='fw-bold text-primary'>{work.id}</td>
                                    <td>{work.namework}</td>
                                    <td className='text-muted small text-truncate' style={{ maxWidth: '200px' }}>{work.detail}</td>
                                    {/* แสดงวันที่จบงาน ถ้ามี */}
                                    <td>{work.finishDate ? new Date(work.finishDate).toLocaleDateString('th-TH') : '-'}</td>
                                    <td>{getStatusBadge(work.status)}</td>
                                </tr>
                            )) : <tr><td colSpan="5" className="text-center p-4 text-muted">ไม่พบข้อมูล</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
export default UserWorkSheet