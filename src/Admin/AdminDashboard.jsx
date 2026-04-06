// src/components/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { ShoppingCart, DollarSign, ArrowUp } from 'lucide-react';

import { getAllNotifications, getTasks } from '../data/dataOperations';
import { getFinancialData } from '../data/dataAnalytics';

const AdminDashboard = ({ tasks }) => {
  const [timeRange] = useState('1year');
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [dashboardData, setDashboardData] = useState({ salesData: [], stats: [] });

  useEffect(() => {
    const currentTasks = (tasks && tasks.length > 0) ? tasks : (getTasks ? getTasks() : []);
    setNotifications(getAllNotifications());
    const data = getFinancialData('1year', currentTasks);
    setDashboardData(data);
  }, [tasks]);

  const unreadCount = notifications.filter(n => n.unread).length;
  const { salesData, stats } = dashboardData;

  if (!salesData || !stats) return <div className="p-4">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="p-4" style={{ width: '100%', minHeight: '100vh', marginLeft: '14rem' }}>

      {/* --- Header --- */}
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h3 className="mb-2 fw-bold text-dark">
            <i className="bi bi-bar-chart-fill me-2 text-primary"></i>Admin Dashboard
          </h3>
          <p className="text-muted small">ภาพรวมสถิติรายได้รายเดือน (ปีปัจจุบัน)</p>
        </div>

        {/* Notification Bell */}
        <div className="position-relative">
          <button
            className="btn btn-light position-relative shadow-sm border"
            onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
          >
            <i className="bi bi-bell-fill text-secondary"></i>
            {unreadCount > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotificationDropdown && (
            <div className="position-absolute end-0 mt-2 bg-white rounded shadow-lg border" style={{ width: '350px', maxHeight: '500px', overflowY: 'auto', zIndex: 1000 }}>
              <div className="p-3 border-bottom bg-light">
                <h6 className="mb-0 fw-bold text-dark">การแจ้งเตือน</h6>
              </div>
              <div>
                {notifications.length > 0 ? (
                  notifications.map(n => (
                    <div key={n.id} className="p-3 border-bottom hover-bg-light">
                      <h6 className="mb-1 fw-bold text-dark" style={{ fontSize: '0.9rem' }}>{n.title}</h6>
                      <p className="mb-0 small text-muted">{n.message}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-muted small">ไม่มีการแจ้งเตือนใหม่</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- Stats Cards --- */}
      <div className="row g-3 mb-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="col-12 col-md-6">
            <div className="card h-100 border-0 shadow-sm hover-shadow transition-all">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className={`${idx === 0 ? 'bg-primary bg-opacity-10 text-primary' : 'bg-success bg-opacity-10 text-success'} p-3 rounded-circle`}>
                    {idx === 0 ? <DollarSign size={24} /> : <ShoppingCart size={24} />}
                  </div>
                  <div className={`fw-bold d-flex align-items-center gap-1 ${stat.isPositive ? 'text-success' : 'text-danger'}`}>
                    <ArrowUp size={16} /> {stat.change}
                  </div>
                </div>
                <h6 className="text-muted mb-1 text-uppercase small fw-bold">{stat.title}</h6>
                <h3 className="fw-bold mb-0 text-dark">{stat.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- Chart Section --- */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3">
          <h6 className="m-0 fw-bold text-primary">
            กราฟแสดงรายได้รายเดือน (ปีปัจจุบัน)
          </h6>
        </div>
        <div className="card-body">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={salesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6c757d', fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6c757d', fontSize: 12 }}
                tickFormatter={(value) => `฿${value / 1000}k`}
              />
              {/* --- จุดที่แก้ไข Tooltip --- */}
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}
                formatter={(value, name) => {
                  if (name.includes('รายได้')) {
                    return [`฿${value.toLocaleString()}`, name];
                  }
                  return [`${value} งาน`, name];
                }}
              />

              <Legend wrapperStyle={{ paddingTop: '20px' }} />

              <Line
                name="รายได้ (บาท)"
                type="monotone"
                dataKey="sales"
                stroke="#0d6efd"
                strokeWidth={3}
                dot={{ r: 4, fill: '#0d6efd', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6 }}
              />

              <Line
                name="จำนวนงานที่เสร็จ"
                type="monotone"
                dataKey="orders"
                stroke="#198754"
                strokeWidth={3}
                dot={{ r: 4, fill: '#198754', strokeWidth: 2, stroke: '#fff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;