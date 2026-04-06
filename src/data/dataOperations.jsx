// src/data/dataOperations.jsx
import { getEmployeeById } from './dataCore';

// -----------------------------------------------------------
// 1. กองเอกสารใบงาน (Work Tickets Database)
// เปรียบเสมือน "กระบะใส่ใบงาน" ที่รวบรวมงานทุกสถานะไว้ที่นี่
// ทั้งงานที่รอทำ (Pending), กำลังทำ (InProgress), หรือเสร็จแล้ว (Completed)
// -----------------------------------------------------------
export let workTickets = [
    // (ข้อมูล Mockup ใบงานต่างๆ จะถูกเก็บใน Array นี้)
    // ข้อมูลประกอบด้วย: รหัสงาน, ชื่องาน, ชื่อช่าง, สถานที่, รายการวัสดุ ฯลฯ
    {
        id: "WJ-001",
        namework: "ซ่อมเครื่องปรับอากาศ ชั้น 2",
        technicianName: "สมชาย ใจดี",
        typework: "ช่างแอร์", // Corrective Maintenance
        datework: "2025-11-27",
        role: "อาคาร A ห้อง Server Room", // ในหน้า AdminWork ถูกนำไปแสดงเป็น 'สถานที่'
        materials: [ // ต้องเป็น Array เพราะฟังก์ชัน getAllWorks จะเอาไป map ต่อ
            { name: "Capacitor 45uF", qty: 1, unit: "ตัว" },
            { name: "น้ำยาแอร์ R32", qty: 2, unit: "กิโลกรัม" }
        ],
        cost: 1500,
        detail: "แอร์ไม่เย็น มีแต่ลมร้อน ตรวจสอบพบ Capacitor บวม ทำการเปลี่ยนเรียบร้อย",
        completed: false, // true = ช่างแจ้งเสร็จสิ้น (สีเขียว)
        approved: false, // false = รอ Admin อนุมัติ (จะโชว์ในตาราง)
        report: { issues: "" }
    },
    {
        id: "WJ-002",
        namework: "เปลี่ยนหลอดไฟทางเดิน",
        technicianName: "วิชัย ไฟแรง",
        typework: "ช่างไฟฟ้า", // Preventive Maintenance
        datework: "2025-11-28",
        role: "ทางเดินเชื่อมตึก B-C",
        materials: [
            { name: "หลอด LED T8", qty: 4, unit: "หลอด" },
            { name: "Starter", qty: 4, unit: "ตัว" }
        ],
        cost: 600,
        detail: "เปลี่ยนหลอดไฟที่กระพริบและดับ",
        completed: false,
        approved: false,
        report: { issues: "พบขั้วหลอดไฟเริ่มกรอบ ควรวางแผนเปลี่ยนโคมใหม่เดือนหน้า" } // มีรายงานปัญหา (จะโชว์ตัวหนังสือสีแดง)
    },
    {
        id: "WJ-003",
        namework: "ตรวจสอบระบบปั๊มน้ำ",
        technicianName: "อำนาจ จัดการ",
        typework: "ช่างปะปา",
        datework: "2025-11-28",
        role: "ดาดฟ้า อาคารจอดรถ",
        materials: [], // ไม่มีการใช้วัสดุ
        cost: 0,
        detail: "กำลังไล่เช็คแรงดันน้ำตามท่อ",
        completed: false, // false = กำลังดำเนินการ (สีเหลือง)
        approved: false,
        report: { issues: "" }
    }
];

// -----------------------------------------------------------
// 2. กล่องข้อความแจ้งเตือน (Notifications)
// เปรียบเสมือน "บอร์ดติดประกาศ" สำหรับแจ้ง User หรือ Leader
// -----------------------------------------------------------
export const notifications = [
    { id: 1, type: "Work", title: "งานใหม่", message: "คุณได้รับมอบหมายงาน #WJ-2025-001", targetRole: "user", unread: true, time: "10 นาทีที่แล้ว" },
    { id: 2, type: "Approve", title: "รอตรวจสอบ", message: "งาน #WJ-2025-002 รอการตรวจสอบ", targetRole: "leader", unread: true, time: "1 ชั่วโมงที่แล้ว" }
];

// -----------------------------------------------------------
// 3. ฟังก์ชันจัดการงานหลัก (Main Operations)
// เปรียบเสมือน "เครื่องมือ" ที่ Admin หรือ Manager หยิบไปใช้จัดการใบงาน
// -----------------------------------------------------------

// ฟังก์ชัน: ขอดูงานทั้งหมด (Get All Works)
// หน้าที่: ดึงใบงานทั้งหมดออกมา และช่วย "จัดระเบียบรายการวัสดุ" ให้เป็นข้อความยาวๆ เพื่อให้เอาไปใส่ในตารางได้ง่าย
export const getAllWorks = () => workTickets.map(work => ({
    ...work,
    // แปลงรายการวัสดุหลายๆ ชิ้น (Array) ให้เป็นข้อความบรรทัดเดียว (String)
    material: work.materials.map(m => `${m.name} (${m.qty} ${m.unit})`).join(', ') || 'ไม่มี',
}));

// *** [ส่วนที่แก้ไขเพิ่ม] ***
// ฟังก์ชัน: ขอดูงานทั้งหมด (ชื่อสำรอง)
// สาเหตุ: AdminDashboard เรียกหาคำว่า 'getTasks' แต่เรามีแค่ 'getAllWorks'
// วิธีแก้: สร้างชื่อ 'getTasks' ขึ้นมา แล้วชี้ไปทำงานเหมือน 'getAllWorks' เป๊ะๆ
export const getTasks = getAllWorks;

// ฟังก์ชัน: อนุมัติงาน (Approve)
// หน้าที่: ประทับตรา "Approved" ลงบนใบงาน
export const approveWork = (id) => {
    // 1. ค้นหาใบงานตามรหัส ID
    const workIndex = workTickets.findIndex(work => work.id === id);
    if (workIndex !== -1) {
        // 2. ถ้าเจอ ให้แก้สถานะเป็น Approved (สีเขียว)
        workTickets[workIndex] = {
            ...workTickets[workIndex],
            status: "Approved",
            approved: true
        };
        console.log(`Work ${id} Approved`); // แจ้งเตือนหลังบ้าน
        return true; // บอกว่าทำสำเร็จ
    }
    return false; // หาไม่เจอ
};

// ฟังก์ชัน: ไม่อนุมัติ/ตีกลับงาน (Reject)
// หน้าที่: ประทับตรา "Rejected" เพื่อส่งคืนช่าง
export const rejectWork = (id) => {
    const workIndex = workTickets.findIndex(work => work.id === id);
    if (workIndex !== -1) {
        workTickets[workIndex] = {
            ...workTickets[workIndex],
            status: "Rejected", // สถานะถูกตีกลับ
            approved: false
        };
        console.log(`Work ${id} Rejected`);
        return true;
    }
    return false;
};

// -----------------------------------------------------------
// 4. Helper Functions (เครื่องมือช่วยค้นหาอื่นๆ)
// -----------------------------------------------------------

// ค้นหางาน "เฉพาะของฉัน" (ใช้โดยหน้าจอช่างเทคนิค)
export const getMyWorks = (technicianId) => workTickets.filter(w => w.assigneeId === technicianId);

// ค้นหางาน "ตามวันที่" (ใช้โดยหน้าจอปฏิทิน)
export const getWorksByDate = (dateString) => workTickets.filter(w => w.datework === dateString);

// ค้นหางานที่ "เสร็จแล้วแต่รอตรวจ" (ใช้โดยหน้าจอหัวหน้างาน)
export const getPendingApprovals = () => workTickets.filter(w => w.status === 'Completed' && !w.approved);

// ดึงแจ้งเตือนทั้งหมด
export const getAllNotifications = () => notifications;