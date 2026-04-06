// src/components/ManagerDashboard.jsx
import React, { useState, useMemo } from 'react';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { ShoppingCart, DollarSign, ArrowUp } from 'lucide-react';
import { getFinancialData } from '../data/dataAnalytics';

// รับ props { tasks } เข้ามา
const ManagerDashboard = ({ tasks }) => {
    // Default เป็นดูภาพกว้าง 10 ปี เพื่อให้เห็นข้อมูลชัดเจน
    const [timeRange, setTimeRange] = useState('1year');

    // ส่ง tasks เข้าไปใน getFinancialData เพื่อคำนวณ
    // useMemo ช่วยให้ไม่ต้องคำนวณใหม่ซ้ำๆ ถ้ายอดงานไม่ได้เปลี่ยน
    const dashboardData = useMemo(() => getFinancialData(timeRange, tasks), [timeRange, tasks]);

    const { salesData, stats, categoryData, customerData, COLORS, PIE_COLORS } = dashboardData;

    if (!salesData) return <div className="p-4">Loading...</div>;

    // ฟังก์ชันเปลี่ยนข้อความปุ่ม
    const getButtonLabel = (range) => {
        if (range === '1year') return 'รายเดือน (ปีนี้)';
        if (range === '5years') return '5 ปีล่าสุด';
        return '10 ปีล่าสุด';
    };

    return (
        <div style={{ marginLeft: '14rem', minHeight: '100vh', width: 'calc(100% - 14rem)', padding: '2rem' }}>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Manager Dashboard</h1>
                <p className="text-muted">ข้อมูล 10 ปีย้อนหลังคือ Mockup, ปีปัจจุบันคำนวณจากงานที่ Approved แล้ว</p>
            </div>

            {/* ส่วนปุ่มเลือกช่วงเวลา (1ปี / 5ปี / 10ปี) */}
            <div className="mb-4 btn-group">
                {['1year', '5years', '10years'].map(range => (
                    <button
                        key={range}
                        type="button"
                        className={`btn ${timeRange === range ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setTimeRange(range)}
                    >
                        {getButtonLabel(range)}
                    </button>
                ))}
            </div>

            {/* ส่วนแสดง Stat Cards (การ์ดตัวเลขสรุปผล) */}
            <div className="row g-3 mb-4">
                {stats.map((stat, idx) => (
                    <div key={idx} className="col-12 col-md-6">
                        <div className="card h-100 border-0 shadow-sm">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <div className={`${idx === 0 ? 'bg-primary' : 'bg-success'} text-white p-3 rounded`}>
                                        {idx === 0 ? <DollarSign size={24} /> : <ShoppingCart size={24} />}
                                    </div>
                                    <div className="fw-bold d-flex align-items-center gap-1 text-success">
                                        <ArrowUp size={16} /> {stat.change}
                                    </div>
                                </div>
                                <h6 className="text-muted mb-1">{stat.title}</h6>
                                <h3 className="fw-bold mb-0">{stat.value}</h3>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* กราฟเส้น (Growth Chart) */}
            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <h5 className="card-title mb-4">ภาพรวมการเติบโต</h5>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={salesData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis yAxisId="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <Tooltip />
                            <Legend />
                            <Line yAxisId="left" type="monotone" dataKey="sales" name="ยอดขาย (บาท)" stroke="#0d6efd" activeDot={{ r: 8 }} />
                            <Line yAxisId="right" type="monotone" dataKey="orders" name="จำนวนงาน" stroke="#198754" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* กราฟวงกลมและแท่ง (Charts Row) */}
            <div className="row g-4">
                <div className="col-12 col-lg-6">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-body">
                            <h5 className="card-title mb-4">รายได้ตามหมวดหมู่</h5>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={categoryData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="category" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="value" name="มูลค่า" fill="#8884d8">
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-lg-6">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-body">
                            <h5 className="card-title mb-4">สัดส่วนลูกค้า</h5>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={customerData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        label
                                    >
                                        {customerData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerDashboard;