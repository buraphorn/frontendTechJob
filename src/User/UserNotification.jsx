import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// ตรวจสอบให้แน่ใจว่าคุณได้ติดตั้ง react-bootstrap เช่น npm install react-bootstrap bootstrap
import { Badge } from 'react-bootstrap';

const UserNotification = () => {
    // 1. แก้ไขการใช้งาน Hook ที่ถูกต้อง
    const navigate = useNavigate();
    const location = useLocation();

    // ข้อมูลที่ส่งมาจาก navigate('/notifications', { state: { message: '...', status: '...' } })
    const notificationData = location.state;

    // ฟังก์ชันสำหรับดึงรหัสใบงานออกจากข้อความ (WJ-2025-1234)
    const getWorkDetails = (message) => {
        // ใช้ Regular Expression เพื่อค้นหารูปแบบ WJ-XXXX-XXXX
        const workIdMatch = message?.match(/(\w+-\d{4}-\d{4})/);
        const workId = workIdMatch ? workIdMatch[1] : 'N/A';

        // ชื่อใบงานคือส่วนที่เหลือของข้อความ
        const workName = message?.replace(workIdMatch?.[0], '').replace('ส่งงาน', '').trim() || 'ข้อมูลงาน';

        return { workId, workName };
    }

    // สร้างรายการแจ้งเตือนจากข้อมูลที่ส่งมา
    const items = notificationData ? (() => {
        const { workId, workName } = getWorkDetails(notificationData.message);

        return [{
            id: workId,
            name: workName,
            status: notificationData.status
        }];
    })() : [];

    // ฟังก์ชันสำหรับกำหนดสี Badge ตามสถานะ (Bootstrap Colors)
    const getBadgeColor = (status) => {
        switch (status) {
            case 'success':
                return 'success'; // สีเขียว
            case 'error':
                return 'danger';  // สีแดง
            default:
                return 'secondary'; // สีเทา
        }
    };

    const goBack = () => {
        // ใช้ navigate(-1) แทน window.history.back() เพื่อให้ทำงานร่วมกับ Router ได้ดี
        navigate(-1);
    }

    return (
        <div className="container mt-4" style={{ marginLeft: '15rem' }}>
            <button className='btn btn-primary' onClick={goBack} >
                <i className="bi bi-arrow-left-short"></i> &nbsp;
                ย้อนกลับ
            </button>

            <h1 className="p-4 text-primary">
                <i className="bi bi-bell-fill me-2"></i> แจ้งเตือนสถานะงาน
            </h1>

            <table className="table table-striped table-hover shadow-sm rounded-lg overflow-hidden">
                <thead className="table-primary">
                    <tr>
                        <th>รหัสใบงาน</th>
                        <th>ชื่อใบงาน</th>
                        <th>สถานะ</th>
                    </tr>
                </thead>
                <tbody>
                    {items.length > 0 ? (
                        items.map((item, index) => (
                            <tr key={index}>
                                {/* ใช้ item.id และ item.name ที่ถูก Parse แล้ว */}
                                <th scope="row">{item.id}</th>
                                <td>{item.name}</td>
                                <td>
                                    <Badge bg={getBadgeColor(item.status)} className='fs-6'>
                                        {item.status === 'success' ? 'สำเร็จ' : item.status}
                                    </Badge>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="3" className="text-center text-muted">ไม่พบรายการแจ้งเตือนล่าสุด</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}
export default UserNotification