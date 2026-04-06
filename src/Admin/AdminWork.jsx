import React, { useState, useEffect } from 'react';
// นำเข้าฟังก์ชันที่จำเป็น
import { getAllWorks, approveWork, rejectWork } from '../data/dataOperations';

const AdminWork = () => {
  const [selectedWork, setSelectedWork] = useState(null);
  // ใช้ worksToApprove แทน paginatedWorks เพื่อสื่อความหมาย
  const [worksToApprove, setWorksToApprove] = useState([]);

  // ฟังก์ชันดึงและกรองงานที่รออนุมัติ
  const fetchPendingWorks = () => {
    const allWorks = getAllWorks();
    // กรองเฉพาะงานที่ยังไม่ได้รับการอนุมัติ (approved: false)
    const pendingApproval = allWorks.filter(work => !work.approved);
    setWorksToApprove(pendingApproval);
  };

  useEffect(() => {
    fetchPendingWorks();
  }, []); // เรียกใช้แค่ครั้งแรกเมื่อ Component โหลด

  const handleRowClick = (work) => {
    setSelectedWork(work);
  };

  // ลบ handleToggleStatus ออกไป

  const handleApprove = (id) => {
    if (approveWork(id)) {
      // แทนที่จะ filter ออก (ลบ), เราใช้ map เพื่อหาตัวเดิมแล้วเปลี่ยนค่า
      const updatedWorks = worksToApprove.map(work => {
        if (work.id === id) {
          // เปลี่ยนสถานะเป็น approved: true และ completed: true (ตามที่คุณต้องการ)
          return { ...work, approved: true, completed: true };
        }
        return work;
      });

      setWorksToApprove(updatedWorks);

      // อัปเดต selectedWork ด้วย ถ้ากำลังเปิดดูอยู่ เพื่อให้ปุ่มเปลี่ยนสถานะทันที
      if (selectedWork && selectedWork.id === id) {
        setSelectedWork({ ...selectedWork, approved: true, completed: true });
      }

      alert(`✅ งาน #${id} ได้รับการอนุมัติแล้ว`);
    } else {
      alert(`❌ ไม่สามารถอนุมัติงาน #${id} ได้`);
    }
  };

  const handleReject = (id) => {
    if (rejectWork(id)) { // อัปเดตฐานข้อมูล
      // อัปเดต State ในหน้าจอ: กรองงานที่ถูกปฏิเสธออกไป
      const updatedWorks = worksToApprove.filter(work => work.id !== id);
      setWorksToApprove(updatedWorks);

      if (selectedWork && selectedWork.id === id) {
        setSelectedWork(null); // ปิดแผงรายละเอียด
      }
      alert(`❌ งาน #${id} ถูกตีกลับ (ไม่อนุมัติ)`);
    } else {
      alert(`❌ ไม่สามารถตีกลับงาน #${id} ได้`);
    }
  };

  // แยกนับตามสถานะ (จาก worksToApprove)
  // งานที่รออนุมัติ: completed=true คือ ช่างแจ้งเสร็จสิ้นแล้ว
  const completedCount = worksToApprove.filter(w => w.completed).length;
  // งานที่รออนุมัติ: completed=false คือ ช่างกำลังทำ/ยังไม่เริ่ม แต่ Leader/Admin ยังไม่เคยกดอนุมัติ
  const inProgressCount = worksToApprove.filter(w => !w.completed).length;

  return (
    <div className="p-4" style={{ width: '100%', minHeight: '100vh', marginLeft: '14rem' }}>
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold mb-2 flex items-center">
          <i className="bi bi-file-earmark-plus-fill mx-3"></i>
          เบิกวัสดุ
        </h3>
        <p className="text-gray-600">จัดการและตรวจสอบงานที่ช่างส่งมาเพื่อขออนุมัติ</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg mr-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">งานรออนุมัติทั้งหมด</p>
              <h3 className="text-2xl font-bold">{worksToApprove.length}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg mr-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">อนุมัติเสร็จสิ้น</p>
              <h3 className="text-2xl font-bold">{completedCount}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-lg mr-3">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">รอดำเนินการ</p>
              <h3 className="text-2xl font-bold">{inProgressCount}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Table */}
        <div className={selectedWork ? "lg:col-span-7" : "lg:col-span-12"}>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto" style={{ maxHeight: '60vh' }}>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">รหัส</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อช่าง</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">ประเภท</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วัสดุที่ใช้ (สรุป)</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะช่าง</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {worksToApprove.length > 0 ? (
                    worksToApprove.map((work) => (
                      <tr
                        key={work.id}
                        onClick={() => handleRowClick(work)}
                        className={`cursor-pointer hover:bg-gray-50 transition-colors ${selectedWork?.id === work.id ? 'bg-blue-50' : ''
                          }`}
                      >
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                            #{work.id}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-left">
                          <div className="font-semibold text-gray-900">{work.technicianName}</div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {work.typework}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-900">
                          {new Date(work.datework).toLocaleDateString('th-TH')}
                        </td>
                        <td className="px-4 py-3 text-left text-sm text-gray-600">
                          {work.material}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${work.completed
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                              }`}
                          >
                            {work.completed ? 'เสร็จสิ้น' : 'ดำเนินการ'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-4 py-12 text-center text-gray-500">
                        <svg className="w-16 h-16 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-lg font-medium">ไม่มีงานรออนุมัติ</p>
                        <p className="text-sm">งานทั้งหมดได้รับการอนุมัติแล้ว หรือถูกตีกลับไปแก้ไข</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Detail Panel */}
        {selectedWork && (
          <div className="lg:col-span-5">
            <div className="bg-white rounded-lg shadow-sm sticky top-4" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
                <h5 className="font-bold flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  รายละเอียดงาน #{selectedWork.id}
                </h5>
                <button
                  onClick={() => setSelectedWork(null)}
                  className="text-white hover:bg-blue-700 rounded px-2 py-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-4">
                <div className="mb-4 pb-4 border-b">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xl font-bold mb-2">{selectedWork.namework}</h4>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {selectedWork.typework}
                      </span>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${selectedWork.completed
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                      }`}>
                      {selectedWork.completed ? 'อนุมัติเสร็จสิ้น' : 'รอดำเนินการ'}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h6 className="text-sm text-gray-500 mb-1 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      ชื่อช่าง
                    </h6>
                    <p className="ml-6 font-medium">{selectedWork.technicianName}</p>
                  </div>

                  {/* ข้อมูลอื่นๆ */}
                  <div>
                    <h6 className="text-sm text-gray-500 mb-1 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      วันที่ทำงาน
                    </h6>
                    <p className="ml-6 font-medium">
                      {new Date(selectedWork.datework).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>

                  <div>
                    <h6 className="text-sm text-gray-500 mb-1 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      สถานที่
                    </h6>
                    <p className="ml-6 font-medium">{selectedWork.role}</p>
                  </div>

                  <div>
                    <h6 className="text-sm text-gray-500 mb-1 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                      </svg>
                      วัสดุที่ใช้
                    </h6>
                    <p className="ml-6 font-medium">{selectedWork.material}</p>
                  </div>

                  {/* ลบจำนวนออกเพราะรวมอยู่ในวัสดุแล้ว */}

                  {/* ลบ phone ออก เพราะไม่มีในโครงสร้างข้อมูล */}


                  {selectedWork.cost && (
                    <div>
                      <h6 className="text-sm text-gray-500 mb-1 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                        </svg>
                        ค่าใช้จ่ายรวม
                      </h6>
                      <p className="ml-6 font-medium text-green-600">{selectedWork.cost.toLocaleString()} บาท</p>
                    </div>
                  )}

                  {selectedWork.detail && (
                    <div>
                      <h6 className="text-sm text-gray-500 mb-1 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                        </svg>
                        รายละเอียดงาน
                      </h6>
                      <p className="ml-6 text-gray-700">{selectedWork.detail}</p>
                    </div>
                  )}
                  {selectedWork.report?.issues && (
                    <div>
                      <h6 className="text-sm text-gray-500 mb-1 flex items-center">
                        <i className="bi bi-exclamation-triangle-fill text-red-500 me-2"></i>
                        ประเด็นที่ช่างรายงาน
                      </h6>
                      <p className="ml-6 text-red-700 font-medium">{selectedWork.report.issues}</p>
                    </div>
                  )}
                </div>

                <div className="mt-6 space-y-2">
                  {/* ปุ่มอนุมัติ */}
                  <button
                    onClick={() => handleApprove(selectedWork.id)}
                    className="btn btn-outline-success w-100 flex items-center justify-center bg-green-500 hover:bg-green-600 font-bold py-2 px-4 rounded"
                  >
                    <i className="bi bi-check-circle me-2"></i>
                    อนุมัติงาน
                  </button>
                  {/* ปุ่มแก้ไข (สามารถเพิ่ม Modal สำหรับใส่โน้ต/เหตุผลการตีกลับ) */}
                  <button className="btn btn-outline-warning w-100 flex items-center justify-center bg-yellow-500 hover:bg-yellow-600 efont-bold py-2 px-4 rounded">
                    <i className="bi bi-pencil-square me-2"></i>
                    แก้ไข/ส่งโน้ตกลับไป
                  </button>
                  {/* ปุ่มไม่อนุมัติ */}
                  <button
                    onClick={() => handleReject(selectedWork.id)}
                    className="btn btn-outline-danger w-100 flex items-center justify-center bg-red-500 hover:bg-red-600 font-bold py-2 px-4 rounded"
                  >
                    <i className="bi bi-x-circle me-2"></i>
                    ไม่อนุมัติ / ตีกลับ
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminWork;