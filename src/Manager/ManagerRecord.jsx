import React, { useState, useEffect } from 'react';
import {
    X, ChevronLeft, MapPin, Wrench, Search, Filter,
    Zap, Droplets, Wind, Calendar, DollarSign, TrendingUp
} from 'lucide-react';

// รับค่า tasks (ข้อมูลงานทั้งหมด) เข้ามาใช้งาน
const ManagerRecord = ({ tasks }) => {
    // --- ตัวแปรสำหรับเก็บข้อมูลหน้าจอ ---
    const [records, setRecords] = useState([]); // เก็บรายการงานทั้งหมดที่คำนวณเงินแล้ว
    const [filteredRecords, setFilteredRecords] = useState([]); // เก็บรายการที่ผ่านการค้นหา
    const [selectedJob, setSelectedJob] = useState(null); // เก็บงานที่กำลังคลิกดูรายละเอียด
    const [searchTerm, setSearchTerm] = useState(''); // เก็บคำค้นหา

    // --- ฟังก์ชันหลัก: คำนวณเงินเมื่อข้อมูล tasks เปลี่ยนแปลง ---
    useEffect(() => {
        // 1. กรองเอาเฉพาะงานที่ "ส่งเข้าระบบแล้ว" (ไม่เอาฉบับร่าง Draft)
        const activeWorks = tasks.filter(t => t.status !== 'Draft');

        // 2. วนลูปงานแต่ละชิ้น เพื่อคำนวณเงิน
        const formattedData = activeWorks.map(work => {

            // --- สูตรการคำนวณจริง ---
            // รายได้: ดึงจาก 'money' ถ้าไม่มีให้เป็น 0
            const income = Number(work.money) || 0;

            // ต้นทุน: ดึงจาก 'cost' ถ้าไม่มีให้เป็น 0
            const expense = Number(work.cost) || 0;

            // กำไร: รายได้ - ต้นทุน
            const profit = income - expense;

            // ส่งข้อมูลกลับไปแสดงผล
            return {
                ...work, // เอาข้อมูลเดิมทั้งหมดมาด้วย
                expense: expense,
                income: income,
                profit: profit,
                contact: work.contact || '081-234-5678',
                jobType: work.typework
            };
        });

        // 3. เรียงลำดับตามวันที่ (ใหม่สุดขึ้นก่อน)
        formattedData.sort((a, b) => new Date(b.datework) - new Date(a.datework));

        // 4. บันทึกข้อมูลลงตัวแปร เพื่อแสดงผล
        setRecords(formattedData);
        setFilteredRecords(formattedData);
    }, [tasks]); // สั่งให้ทำงานใหม่ทุกครั้งที่ tasks เปลี่ยนแปลง

    // --- ฟังก์ชันค้นหา (Search) ---
    useEffect(() => {
        // กรองข้อมูลตามคำค้นหา (ชื่อคน, ชื่องาน, รหัสงาน)
        const results = records.filter(item =>
            item.namework.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.technicianName && item.technicianName.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredRecords(results);
    }, [searchTerm, records]);

    // ฟังก์ชันแปลงวันที่ให้เป็นภาษาไทย (เช่น 25 พ.ย. 68)
    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        const date = new Date(dateStr);
        return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });
    };

    // ฟังก์ชันเลือกไอคอนตามประเภทงาน
    const getJobIcon = (type) => {
        if (type?.includes('ไฟฟ้า')) return <Zap size={18} className="text-yellow-500" />;
        if (type?.includes('ประปา')) return <Droplets size={18} className="text-blue-500" />;
        if (type?.includes('แอร์') || type?.includes('IT')) return <Wind size={18} className="text-cyan-500" />;
        return <Wrench size={18} className="text-gray-400" />;
    };

    return (
        <div style={{ marginLeft: '14rem', minHeight: '100vh', width: 'calc(100% - 14rem)', padding: '2rem' }} className="bg-slate-50 font-sans">

            {/* Header Section */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">บันทึกประวัติการเงิน</h1>
                    <p className="text-slate-500 mt-1 text-sm">ตรวจสอบรายรับ-รายจ่าย และผลกำไรของแต่ละงาน</p>
                </div>

                {/* Search Bar */}
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="ค้นหาชื่องาน..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 shadow-sm bg-white"
                        />
                    </div>
                </div>
            </div>

            {/* Main Content Card (ตารางแสดงรายการ) */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-lg border border-white/50 p-8 min-h-[600px]">

                {/* Table Header (หัวตาราง) */}
                <div className="grid grid-cols-12 gap-4 px-6 mb-4 text-slate-400 font-medium text-sm tracking-wide uppercase">
                    <div className="col-span-4 pl-2">รายการงาน</div>
                    <div className="col-span-2 text-center">วันที่ทำรายการ</div>
                    <div className="col-span-2 text-right pr-4">ต้นทุน</div>
                    <div className="col-span-2 text-right pr-4">รายได้</div>
                    <div className="col-span-2 text-center">สถานะกำไร</div>
                </div>

                {/* List Items (รายการงาน) */}
                <div className="space-y-3">
                    {filteredRecords.length > 0 ? (
                        filteredRecords.map((item, idx) => (
                            <div
                                key={idx}
                                onClick={() => setSelectedJob(item)}
                                className="group grid grid-cols-12 gap-4 px-6 py-5 bg-white border border-gray-100 hover:border-blue-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 rounded-2xl items-center cursor-pointer"
                            >
                                {/* Column 1: ชื่องาน + ไอคอน */}
                                <div className="col-span-4 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-gray-100 group-hover:bg-blue-50 group-hover:text-blue-600 transition">
                                        {getJobIcon(item.jobType)}
                                    </div>
                                    <div className="overflow-hidden">
                                        <div className="font-bold text-slate-700 truncate group-hover:text-blue-700 transition">{item.namework}</div>
                                        <div className="text-xs text-slate-400 truncate">{item.id} • {item.technicianName || 'ยังไม่ระบุช่าง'}</div>
                                    </div>
                                </div>

                                {/* Column 2: วันที่ */}
                                <div className="col-span-2 flex items-center justify-center gap-2 text-slate-500 text-sm">
                                    <Calendar size={14} className="text-slate-300" />
                                    {formatDate(item.datework)}
                                </div>

                                {/* Column 3: ต้นทุน */}
                                <div className="col-span-2 text-right font-medium text-slate-600 font-mono pr-4">
                                    {item.expense.toLocaleString()}
                                </div>

                                {/* Column 4: รายได้ */}
                                <div className="col-span-2 text-right font-bold text-slate-800 font-mono pr-4">
                                    {item.income.toLocaleString()}
                                </div>

                                {/* Column 5: ป้ายกำไร (เขียว/แดง) */}
                                <div className="col-span-2 flex justify-center">
                                    <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${item.profit > 0
                                        ? 'bg-green-50 text-green-600 border-green-100'
                                        : 'bg-red-50 text-red-600 border-red-100'
                                        }`}>
                                        {item.profit > 0 ? <TrendingUp size={12} /> : <TrendingUp size={12} className="rotate-180" />}
                                        {item.profit > 0 ? '+' : ''}{item.profit.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 text-gray-400">ไม่พบข้อมูลงานในระบบ</div>
                    )}
                </div>
            </div>

            {/* Popup Modal (หน้าต่างเด้งแสดงรายละเอียด) */}
            {selectedJob && (
                <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-all">
                    <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden scale-100 animate-fade-in-up">

                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                            <button onClick={() => setSelectedJob(null)} className="p-2 hover:bg-white hover:shadow-sm rounded-full transition text-gray-500">
                                <ChevronLeft size={24} />
                            </button>
                            <div className="text-center">
                                <h3 className="font-bold text-gray-800 text-lg">รายละเอียดการเงิน</h3>
                                <p className="text-xs text-gray-500">{selectedJob.id}</p>
                            </div>
                            <div className="w-10"></div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 space-y-5">
                            {/* Title Card */}
                            <div className="bg-blue-50 rounded-2xl p-5 flex items-start gap-4 border border-blue-100">
                                <div className="p-3 bg-white rounded-full text-blue-600 shadow-sm">
                                    <DollarSign size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 text-lg">{selectedJob.namework}</h4>
                                    <p className="text-slate-500 text-sm mt-1">{selectedJob.detail}</p>
                                    <div className="flex gap-2 mt-3">
                                        <span className="text-xs px-2 py-1 bg-white rounded-md text-slate-600 border border-blue-100">{selectedJob.jobType}</span>
                                        <span className="text-xs px-2 py-1 bg-white rounded-md text-slate-600 border border-blue-100">{formatDate(selectedJob.datework)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="text-xs text-gray-400 mb-1 flex items-center gap-1"><MapPin size={12} /> สถานที่</div>
                                    <div className="font-medium text-gray-700">{selectedJob.location?.address || selectedJob.role || "ไม่ระบุ"}</div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="text-xs text-gray-400 mb-1 flex items-center gap-1"><Wrench size={12} /> ช่างผู้รับผิดชอบ</div>
                                    <div className="font-medium text-gray-700">{selectedJob.technicianName}</div>
                                </div>
                            </div>

                            <hr className="border-dashed border-gray-200" />

                            {/* Financial Summary (สรุปตัวเลขเงิน) */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-gray-500">
                                    <span>ต้นทุนดำเนินการ (วัสดุ)</span>
                                    <span>{selectedJob.expense.toLocaleString()} บาท</span>
                                </div>
                                <div className="flex justify-between items-center font-bold text-lg text-slate-800">
                                    <span>ราคาที่เรียกเก็บ (รายได้จากงานมูลค่า)</span>
                                    <span>{selectedJob.income.toLocaleString()} บาท</span>
                                </div>
                                <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-100 flex justify-between items-center text-green-700">
                                    <span className="font-bold flex items-center gap-2"><TrendingUp size={18} /> กำไรสุทธิ</span>
                                    <span className="font-bold text-xl">
                                        {selectedJob.profit > 0 ? '+' : ''}{selectedJob.profit.toLocaleString()} บาท
                                    </span>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagerRecord;