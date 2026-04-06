// src/data/dataAnalytics.js

export const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
export const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// -----------------------------------------------------------
// 1. ข้อมูลจำลองย้อนหลัง 10 ปี (Mockup History)
// เนื่องจากระบบเพิ่งเริ่ม เราเลยต้องสร้างข้อมูลหลอกๆ ของปีก่อนๆ
// เพื่อให้กราฟ 10 ปีมีข้อมูลแสดง (ถ้าไม่ทำ กราฟจะโล่งๆ)
// -----------------------------------------------------------
const MOCK_HISTORY_DATA = [
    { offset: 1, sales: 1450000, orders: 480 },
    { offset: 2, sales: 1350000, orders: 450 },
    { offset: 3, sales: 1250000, orders: 410 },
    { offset: 4, sales: 1050000, orders: 350 },
    { offset: 5, sales: 1100000, orders: 360 },
    { offset: 6, sales: 950000, orders: 320 },
    { offset: 7, sales: 880000, orders: 290 },
    { offset: 8, sales: 920000, orders: 310 },
    { offset: 9, sales: 850000, orders: 280 },
    { offset: 10, sales: 750000, orders: 250 },
].map(item => ({ ...item, cost: item.sales * 0.6 })); // สมมติว่าต้นทุนคือ 60% ของรายได้

// -----------------------------------------------------------
// 2. ฟังก์ชันคำนวณข้อมูลรายเดือน (สำหรับปีปัจจุบัน)
// อันนี้คือ "ของจริง" จะวิ่งไปดึงข้อมูลจากใบงาน (tasks) มาคำนวณ
// -----------------------------------------------------------
const generateRealMonthlyData = (tasks) => {
    const currentYear = new Date().getFullYear();
    const months = [
        'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];

    // สร้างตาราง 12 เดือนเปล่าๆ รอไว้ (เริ่มต้นเป็น 0)
    const monthlyStats = months.map(m => ({ date: m, sales: 0, cost: 0, orders: 0 }));

    if (!tasks || tasks.length === 0) return monthlyStats;

    // วนลูปงานทุกชิ้นเพื่อหยอดลงในเดือนที่ถูกต้อง
    tasks.forEach(task => {
        // นับเฉพาะงานที่เสร็จแล้ว หรือ อนุมัติแล้ว
        const isCompleted = task.status === 'Approved' || task.completed === true;

        if (isCompleted) {
            const taskDate = new Date(task.datework || task.createdAt || Date.now());
            // เช็คว่าปีของงาน ตรงกับปีปัจจุบันหรือไม่
            if (taskDate.getFullYear() === currentYear) {
                const monthIndex = taskDate.getMonth(); // หาว่าเป็นเดือนไหน (0-11)

                // ดึงรายได้ และ ต้นทุน
                const revenue = Number(task.money) || 0;
                const cost = Number(task.cost) || 0;

                // บวกเลขเข้ายอดเดือนนั้นๆ
                monthlyStats[monthIndex].sales += revenue;
                monthlyStats[monthIndex].cost += cost; // บันทึกต้นทุน
                monthlyStats[monthIndex].orders += 1;
            }
        }
    });

    return monthlyStats; // ส่งคืนข้อมูล 12 เดือน
};

// -----------------------------------------------------------
// 3. Helper: คำนวณยอดรวมของปีนี้ (เพื่อเอาไปรวมกับกราฟรายปี)
// -----------------------------------------------------------
const calculateCurrentYearStats = (tasks) => {
    const currentYear = new Date().getFullYear();
    let currentYearSales = 0;
    let currentYearCost = 0; // เพิ่มตัวแปรเก็บต้นทุนรวม
    let currentYearOrders = 0;

    if (!tasks || tasks.length === 0) return { sales: 0, cost: 0, orders: 0 };

    tasks.forEach(task => {
        const taskDate = new Date(task.datework || task.createdAt || Date.now());

        // *** จุดที่เคย error: ต้องประกาศตัวแปรเหล่านี้ก่อนเรียกใช้ใน if ***
        const isThisYear = taskDate.getFullYear() === currentYear;
        const isCompleted = task.status === 'Approved' || task.completed === true;

        // เช็คเงื่อนไขว่าเป็นงานปีนี้ และเสร็จแล้ว
        if (isThisYear && isCompleted) {
            currentYearOrders += 1;
            currentYearSales += Number(task.money) || 0;
            currentYearCost += Number(task.cost) || 0; // บวกต้นทุนเพิ่ม
        }
    });

    return { sales: currentYearSales, cost: currentYearCost, orders: currentYearOrders };
};

// -----------------------------------------------------------
// 4. ฟังก์ชันสร้างข้อมูลกราฟรายปี (รวม Mockup + ของจริง)
// เอาข้อมูลปีนี้ (ของจริง) มาต่อกับข้อมูลเก่าๆ (Mockup)
// -----------------------------------------------------------
const generateYearlyData = (years, tasks) => {
    const currentYear = new Date().getFullYear();
    const data = [];
    const currentStats = calculateCurrentYearStats(tasks); // ดึงยอดปีนี้

    for (let i = years - 1; i >= 0; i--) {
        const yearLabel = (currentYear - i).toString();

        if (i === 0) {
            // ปีปัจจุบัน (ข้อมูลจริง)
            data.push({
                date: yearLabel,
                sales: currentStats.sales,
                cost: currentStats.cost,
                orders: currentStats.orders,
            });
        } else {
            // ปีเก่า (Mock Data)
            const history = MOCK_HISTORY_DATA.find(h => h.offset === i) || { sales: 500000, cost: 300000, orders: 100 };
            data.push({
                date: yearLabel,
                sales: history.sales,
                cost: history.cost || history.sales * 0.6,
                orders: history.orders,
            });
        }
    }
    return data;
};

// -----------------------------------------------------------
// *** Main Function (หัวหน้าฝ่ายบัญชี) ***
// หน้า Dashboard จะเรียกใช้ฟังก์ชันนี้ตัวเดียว
// -----------------------------------------------------------
export const getFinancialData = (timeRange, tasks = []) => {
    let salesData = [];
    let isRealTimeMode = false;

    // เลือกสูตรคำนวณตามช่วงเวลาที่ user กดเลือก (1ปี, 5ปี, 10ปี)
    switch (timeRange) {
        case '1year':
            salesData = generateRealMonthlyData(tasks);
            isRealTimeMode = true;
            break;
        case '5years':
            salesData = generateYearlyData(5, tasks);
            break;
        case '10years':
            salesData = generateYearlyData(10, tasks);
            break;
        default:
            salesData = generateRealMonthlyData(tasks);
    }

    // คำนวณผลรวม
    const totalRevenue = salesData.reduce((sum, item) => sum + item.sales, 0);
    const totalCost = salesData.reduce((sum, item) => sum + (item.cost || 0), 0);
    const totalOrders = salesData.reduce((sum, item) => sum + item.orders, 0);

    // --- สูตรคำนวณ % กำไรจากต้นทุน (Profit Markup) ---
    // (รายได้ - ต้นทุน) / ต้นทุน * 100
    let profitPercentage = 0;
    if (totalCost > 0) {
        profitPercentage = ((totalRevenue - totalCost) / totalCost) * 100;
    } else if (totalRevenue > 0) {
        // กรณีไม่มีต้นทุนเลย (Cost = 0) แต่มีรายได้ ให้ถือว่าเป็น 100%
        profitPercentage = 100;
    }

    // ข้อความที่จะแสดงใน Badge เขียวๆ
    const profitText = isRealTimeMode
        ? `กำไร +${profitPercentage.toFixed(1)}%`
        : `กำไรเฉลี่ย +40%`; // Mock สำหรับดูย้อนหลังนานๆ

    // ส่งข้อมูลทั้งหมดกลับไปให้หน้า Dashboard วาดกราฟ
    return {
        salesData: salesData,
        stats: [
            {
                title: 'รายได้รวม (ช่วงเวลานี้)',
                value: `฿${totalRevenue.toLocaleString()}`,
                // แสดง % กำไรที่คำนวณได้
                change: profitText,
                isPositive: true,
                iconType: 'dollar'
            },
            {
                title: 'จำนวนงานที่เสร็จ',
                value: `${totalOrders.toLocaleString()} งาน`,
                change: isRealTimeMode ? 'Real-time' : 'Estimate',  
                isPositive: true,
                iconType: 'cart'
            },
        ],
        categoryData: [
            { category: 'ไฟฟ้า', value: 40 },
            { category: 'ประปา', value: 30 },
            { category: 'แอร์', value: 20 },
            { category: 'อื่นๆ', value: 10 }
        ],
        customerData: [
            { name: 'ลูกค้าเก่า', value: 65 },
            { name: 'ลูกค้าใหม่', value: 35 }
        ],
        COLORS,
        PIE_COLORS
    };
};