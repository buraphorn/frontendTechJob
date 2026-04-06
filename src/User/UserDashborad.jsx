import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'
// แก้ไข: เปลี่ยน ListTask เป็น ClipboardList ซึ่งเป็นชื่อมาตรฐาน
import { TrendingUp, CheckCircle, Clock, Award, Star, ClipboardList } from 'lucide-react'
import React, { useMemo, useState, useCallback } from 'react'

const rankings = [
  { name: 'สมชาย ใจดี', score: 95 },
  { name: 'สมหญิง รักงาน', score: 89 },
  { name: 'วิชัย ขยัน', score: 87 },
  { name: 'มานี มีสุข', score: 85 },
  { name: 'สมศรี สวยงาม', score: 82 },
];

const initialMaterialHistory = [
  { id: 1, name: 'ตะปู 1 นิ้ว', quantity: 50, date: '2025-11-20' },
  { id: 2, name: 'สายไฟ VAF 2x2.5', quantity: 15, date: '2025-11-22' },
  { id: 3, name: 'ท่อ PVC 1/2"', quantity: 3, date: '2025-11-25' },
];

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
  const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const UserDashboard = ({ tasks = [] }) => {

  const [newMaterial, setNewMaterial] = useState({ name: '', quantity: '' });
  const [materialHistory, setMaterialHistory] = useState(initialMaterialHistory);

  // คำนวณ Stats
  const stats = useMemo(() => {
    // ป้องกันกรณี tasks เป็น null หรือ undefined
    const safeTasks = Array.isArray(tasks) ? tasks : [];

    const total = safeTasks.length;
    const completed = safeTasks.filter(w => w.completed === true).length;
    const pendingInspect = safeTasks.filter(w => (w.status === 'PendingInspection' || w.isSubmitted) && !w.completed).length;
    const inProgress = safeTasks.filter(w => !w.completed && w.status !== 'PendingInspection' && !w.isSubmitted).length;

    const successRate = total ? Math.round((completed / total) * 100) : 0;
    const inProgressPercentage = total > 0 ? Math.round((inProgress / total) * 100) : 0;

    const pieData = [
      { name: 'สำเร็จ', color: '#10b981', value: completed },
      { name: 'รอตรวจสอบ', color: '#f59e0b', value: pendingInspect },
      { name: 'กำลังทำ', color: '#f59e0b', value: inProgress },
    ].filter(item => item.value > 0);

    return { total, completed, pendingInspect, inProgress, successRate, inProgressPercentage, pieData };
  }, [tasks]);

  // คำนวณกราฟรายเดือน (เพิ่มความปลอดภัยในการแปลงวันที่)
  const monthlyData = useMemo(() => {
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const data = months.map(m => ({ name: m, jobs: 0 }));

    if (Array.isArray(tasks)) {
      tasks.forEach(task => {
        if (task.datework) {
          const date = new Date(task.datework);
          // เช็คว่า date ถูกต้องหรือไม่ (ป้องกัน Invalid Date)
          if (!isNaN(date.getTime())) {
            const monthIndex = date.getMonth();
            if (monthIndex >= 0 && monthIndex < 12) {
              data[monthIndex].jobs += 1;
            }
          }
        }
      });
    }

    return data;
  }, [tasks]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setNewMaterial(prev => ({ ...prev, [name]: name === 'quantity' ? parseInt(value) || '' : value }));
  }, []);

  const handleSubmitMaterial = useCallback((e) => {
    e.preventDefault();
    if (newMaterial.name.trim() && newMaterial.quantity > 0) {
      const newEntry = {
        id: Date.now(),
        name: newMaterial.name.trim(),
        quantity: newMaterial.quantity,
        date: new Date().toISOString().split('T')[0],
        isManuallyAdded: true
      };
      setMaterialHistory(prev => [newEntry, ...prev]);
      setNewMaterial({ name: '', quantity: '' });
    } else {
      alert("กรุณากรอกชื่อวัสดุและจำนวนให้ถูกต้อง");
    }
  }, [newMaterial]);

  return (
    <div className='p-4' style={{ width: '100%', minHeight: '100vh', overflowX: 'hidden', background: '#F0F8FF', marginLeft: '14rem' }}>

      <div className='p-4'>
        <h1 className='fw-bolder mb-4 text-primary'>
          <i className="bi bi-house-door-fill"></i> &nbsp;
          หน้าหลัก</h1>
        <hr />
      </div>

      <div className='row g-3 mb-4 justify-content-center'>
        {/* Card 1 */}
        <div className='col-md-3'>
          <div className='bg-white rounded-3 shadow-sm p-3 h-100'>
            <div className='d-flex align-items-center justify-content-between'>
              <div>
                <p className='text-muted mb-1 small'>งานทั้งหมดที่ได้รับ</p>
                <h3 className='mb-0 fw-bold text-primary'>{stats.total}</h3>
                <small className='text-primary'>
                  <ClipboardList size={14} className='me-1' />
                  รายการ
                </small>
              </div>
              <div className='bg-primary bg-opacity-10 p-3 rounded-circle'>
                <ClipboardList size={28} className='text-primary' />
              </div>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className='col-md-3'>
          <div className='bg-white rounded-3 shadow-sm p-3 h-100'>
            <div className='d-flex align-items-center justify-content-between'>
              <div>
                <p className='text-muted mb-1 small'>งานสำเร็จ</p>
                <h3 className='mb-0 fw-bold text-success'>{stats.completed}</h3>
                <small className='text-success'>
                  <CheckCircle size={14} className='me-1' />
                  {stats.successRate}% ความสำเร็จ
                </small>
              </div>
              <div className='bg-success bg-opacity-10 p-3 rounded-circle'>
                <Award size={28} className='text-success' />
              </div>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className='col-md-3'>
          <div className='bg-white rounded-3 shadow-sm p-3 h-100'>
            <div className='d-flex align-items-center justify-content-between'>
              <div>
                <p className='text-muted mb-1 small'>รอดำเนินการ/ตรวจสอบ</p>
                <h3 className='mb-0 fw-bold text-warning'>{stats.inProgress + stats.pendingInspect}</h3>
                <small className='text-muted'>
                  <Clock size={14} className='me-1' />
                  เหลืออีก {stats.inProgress + stats.pendingInspect} งาน
                </small>
              </div>
              <div className='bg-warning bg-opacity-10 p-3 rounded-circle'>
                <Clock size={28} className='text-warning' />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='row g-3 mb-3'>
        {/* Bar Chart */}
        <div className='col-lg-8 '>
          <div className='bg-white rounded-3 shadow-sm p-4' style={{ height: '450px' }}>
            <h5 className='fw-bold mb-3'>📈 ปริมาณงานรายเดือน (ปีปัจจุบัน)</h5>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px' }}
                  formatter={(value) => [`${value} งาน`, 'จำนวน']}
                />
                <Legend />
                <Bar dataKey="jobs" fill="#667eea" name="จำนวนงาน" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ranking */}
        <div className='col-lg-4'>
          <div className='bg-white rounded-3 shadow-sm p-4' style={{ height: '450px' }}>
            <div className='d-flex align-items-center justify-content-between mb-4'>
              <h5 className='fw-bold mb-0'>🏆 จัดอันดับผู้ทำงานดีเด่น</h5>
            </div>
            <div style={{ overflowY: 'auto', height: 'calc(100% - 60px)' }}>
              {rankings.map((person, index) => (
                <div key={index} className='position-relative mb-3 rounded-3 overflow-hidden' style={{ background: '#f8f9fa', padding: '10px' }}>
                  <div className='d-flex align-items-center justify-content-between'>
                    <span className='fw-bold'>{index + 1}. {person.name}</span>
                    <span className='badge bg-warning text-dark'>{person.score} คะแนน</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pie Chart */}
        <div className='col-lg-5 col-md-6'>
          <div className='bg-white rounded-3 shadow-sm p-4' style={{ height: '350px' }}>
            <h5 className='fw-bold mb-3'><i className="bi bi-pie-chart-fill"></i> สัดส่วนสถานะงาน</h5>
            {stats.total > 0 ? (
              <ResponsiveContainer width="100%" height="85%">
                <PieChart>
                  <Pie
                    data={stats.pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats.pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value} งาน`, name]} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-100 d-flex align-items-center justify-content-center text-muted">
                ยังไม่มีข้อมูลงาน
              </div>
            )}
          </div>
        </div>

        {/* Material Form */}
        <div className='col-lg-7 col-md-6'>
          <div className='bg-white rounded-3 shadow-sm p-4' style={{ height: '350px', display: 'flex', flexDirection: 'column' }}>
            <h5 className='fw-bold mb-3'>🔨 วัสดุที่ใช้และประวัติการเบิก</h5>
            <form onSubmit={handleSubmitMaterial} className='mb-3 border-bottom pb-3'>
              <div className='row g-2'>
                <div className='col-7'>
                  <input type="text" name="name" className='form-control form-control-sm' placeholder='ชื่อวัสดุ' value={newMaterial.name} onChange={handleInputChange} />
                </div>
                <div className='col-3'>
                  <input type="number" name="quantity" className='form-control form-control-sm' placeholder='จำนวน' value={newMaterial.quantity} onChange={handleInputChange} min="1" />
                </div>
                <div className='col-2'>
                  <button type="submit" className='btn btn-primary btn-sm w-100'>บันทึก</button>
                </div>
              </div>
            </form>
            <div style={{ overflowY: 'auto', flexGrow: 1 }}>
              <ul className='list-group list-group-flush'>
                {materialHistory.map((m) => (
                  <li key={m.id} className='list-group-item d-flex justify-content-between'>
                    <span>{m.name}</span>
                    <span className='badge bg-info'>{m.quantity}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserDashboard;