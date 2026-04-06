import React, { useState, useEffect } from 'react';
import { getEmployeeWithHistory, authUsers } from '../data/dataCore'; // 1. นำเข้าข้อมูล

const ProfileBootstrap = () => {
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    // 2. จำลองการ Login ดึง ID มาจาก authUsers ('user' => id: 11)
    const currentUserId = authUsers['user'].id;

    // 3. ดึงข้อมูลพนักงานพร้อมประวัติงาน
    const data = getEmployeeWithHistory(currentUserId);
    if (data) {
      setUserProfile(data);
    }
  }, []);

  if (!userProfile) {
    return <div className="p-5 text-center">Loading Profile...</div>;
  }

  return (
    <div className="container my-5" style={{marginLeft: '14rem'}}>
      <div className="card-body p-4 p-md-5">

        {/* 🖼️ ส่วนหัวโปรไฟล์ */}
        <header className="text-center mb-5 border-bottom pb-4">
          <div className="mx-auto bg-light rounded-circle mb-3 d-flex align-items-center justify-content-center overflow-hidden"
            style={{ width: '120px', height: '120px', border: '4px solid #0d6efd' }}>
            {userProfile.avatar ? (
              <img src={userProfile.avatar} alt={userProfile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <i className="bi bi-person-fill text-secondary fs-1"></i>
            )}
          </div>

          <h1 className="display-6 fw-bold text-primary">{userProfile.name}</h1>
          <h2 className="fs-5 text-secondary mb-3">{userProfile.role} - {userProfile.typework}</h2>
          <p className="lead text-muted">{userProfile.bio || "ไม่มีข้อมูลสังเขป"}</p>
        </header>

        {/* 📞 ข้อมูลติดต่อ & ข้อมูลส่วนตัว */}
        <div className="row g-4 mb-5">
          {/* คอลัมน์ด้านซ้าย: ข้อมูลติดต่อ */}
          <div className="col-lg-4">
            <div className="p-3 bg-light rounded h-100">
              <h3 className="fs-5 border-bottom pb-2 mb-3 text-dark fw-bold">ข้อมูลติดต่อ</h3>
              <ul className="list-unstyled">
                <li className="mb-2"><strong><i className="bi bi-telephone-fill me-2 text-primary"></i>โทร:</strong> {userProfile.phone}</li>
                <li className="mb-2"><strong><i className="bi bi-envelope-fill me-2 text-primary"></i>รหัสพนักงาน:</strong> {userProfile.id}</li>
                <li><strong><i className="bi bi-geo-alt-fill me-2 text-primary"></i>สถานะ:</strong> <span className={`badge ${userProfile.status === 'ว่าง' ? 'bg-success' : userProfile.status === 'ลา' ? 'bg-danger' : 'bg-warning'}`}>{userProfile.status}</span></li>
              </ul>
            </div>
          </div>

          {/* คอลัมน์ด้านขวา: ข้อมูลการทำงาน */}
          <div className="col-lg-8">
            <div className="p-3 bg-light rounded h-100">
              <h3 className="fs-5 border-bottom pb-2 mb-3 text-dark fw-bold">ข้อมูลการทำงาน</h3>
              <div className="row">
                <div className="col-md-6 mb-2">
                  <strong>ประสบการณ์:</strong> {userProfile.workDuration}
                </div>
                <div className="col-md-6 mb-2">
                  <strong>วันที่เริ่มงาน:</strong> {userProfile.startDate}
                </div>
                <div className="col-md-6 mb-2">
                  <strong>งานที่ถนัด:</strong> {userProfile.job}
                </div>
                <div className="col-md-6 mb-2">
                  <strong>โรคประจำตัว:</strong> {userProfile.disease}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 📋 ประวัติงานที่ผ่านมา (Job History) */}
        {userProfile.jobHistory && userProfile.jobHistory.length > 0 && (
          <div className="mb-5">
            <h3 className="fs-4 border-bottom pb-2 mb-4 text-dark fw-bold">ประวัติงานล่าสุด</h3>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>ชื่องาน</th>
                    <th>บทบาท</th>
                    <th>สถานที่</th>
                    <th>วันที่</th>
                    <th>สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {/* ดึงข้อมูล jobHistory มาแสดงแทน Projects เดิม */}
                  {userProfile.jobHistory.slice(0, 5).map((history) => (
                    <tr key={history.id}>
                      <td>{history.jobTitle}</td>
                      <td>{history.role}</td>
                      <td>{history.location}</td>
                      <td>{history.date}</td>
                      <td><span className="badge bg-success">{history.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProfileBootstrap;