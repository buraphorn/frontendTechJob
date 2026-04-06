import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Upload, ArrowLeft, Send, MapPin, Clock, User, FileText, Camera, CheckCircle, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const JobPostingForm = ({ tasks, setTasks }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const workDataFromCalendar = location.state?.work;

  const [formData, setFormData] = useState({
    startDate: '',
    materials: '',
    issues: '',
    beforeImage: null,
    afterImage: null,
    otherImage: null
  });

  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (!workDataFromCalendar) {
      alert("ไม่พบข้อมูลงาน กรุณาเลือกงานจากปฏิทิน");
      navigate('/calendar');
    }
  }, [workDataFromCalendar, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (field) => (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        [field]: URL.createObjectURL(file)
      }));
    }
  };

  const handleSubmit = () => {
    const updatedTasks = tasks.map(t => {
      if (t.id === workDataFromCalendar.id) {
        return {
          ...t,
          ...formData,
          // --- แก้ไขจุดนี้ ---
          // เปลี่ยนสถานะเป็น 'PendingInspection' (รอตรวจสอบ) เพื่อให้ไปโผล่ที่หน้า Leader
          status: 'PendingInspection',
          completed: false, // ยังไม่ถือว่าเสร็จสมบูรณ์จนกว่าหัวหน้าจะอนุมัติ
          finishDate: new Date().toISOString()
        };
      }
      return t;
    });

    setTasks(updatedTasks);
    alert('✅ ส่งงานเรียบร้อยแล้ว! ข้อมูลถูกส่งไปยังหัวหน้างานเพื่อตรวจสอบ');
    navigate('/calendar'); // หรือจะ navigate ไป worksheet ก็ได้
  };

  // --- ฟังก์ชันสร้าง PDF ---
  const downloadPDF = () => {
    const input = document.getElementById('report-summary');

    // เพิ่ม Option useCORS เพื่อช่วยเรื่องการโหลดรูป
    html2canvas(input, {
      scale: 2,
      useCORS: true,
      logging: true,
      backgroundColor: '#ffffff' // บังคับพื้นหลังสีขาว
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`JobReport-${workDataFromCalendar?.id || 'doc'}.pdf`);
    }).catch(err => {
      console.error("PDF Error:", err);
      alert("เกิดข้อผิดพลาดในการสร้าง PDF: " + err.message);
    });
  };

  if (!workDataFromCalendar) return null;

  return (
    <div className="w-100 overflow-auto" style={{ marginLeft: '14rem' }}>
      {/* Header */}
      <div className="">
        <div className="p-3">
          <div>
            <button onClick={() => navigate(-1)}>
              <span className="btn btn-primary">ย้อนกลับ</span>
            </button>
            <h1 className="font-bold p-4">
              รายงานผลงาน: {workDataFromCalendar.namework}
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Progress Steps */}
        <div className="mb-8 bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'ข้อมูลงาน', icon: FileText },
              { num: 2, label: 'บันทึกผล', icon: Clock },
              { num: 3, label: 'หลักฐาน', icon: Camera },
              { num: 4, label: 'ส่งงาน/PDF', icon: CheckCircle }
            ].map((step, idx) => (
              <React.Fragment key={step.num}>
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${currentStep >= step.num
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-110'
                    : 'bg-gray-200 text-gray-400'
                    }`}>
                    <step.icon size={20} />
                  </div>
                  <span className={`mt-2 text-xs sm:text-sm font-medium ${currentStep >= step.num ? 'text-blue-600' : 'text-gray-400'
                    }`}>
                    {step.label}
                  </span>
                </div>
                {idx < 3 && (
                  <div className={`flex-1 h-1 mx-2 rounded transition-all duration-300 ${currentStep > step.num ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-gray-200'
                    }`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step 1: Job Information */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <FileText className="w-6 h-6" />
                  ข้อมูลงาน
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <InfoRow label="รหัสใบงาน" value={`JOB-${workDataFromCalendar.id}`} icon="🔖" />
                <InfoRow label="ชื่องาน" value={workDataFromCalendar.namework} icon="👤" />
                <InfoRow label="ประเภทงาน" value={workDataFromCalendar.typework} icon="🔧" />
                <InfoRow label="รายละเอียด" value={workDataFromCalendar.detail} icon="📋" />
                <InfoRow label="ช่างผู้รับผิดชอบ" value={workDataFromCalendar.technicianName || '-'} icon="👷" />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <MapPin className="w-6 h-6" />
                  สถานที่ปฏิบัติงาน
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <InfoRow label="ที่อยู่/เบอร์โทร" value={workDataFromCalendar.role} icon="📍" />
              </div>

              <div className="h-64 bg-gray-200">
                <iframe
                  title="google-map"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  src="https://maps.google.com/maps?width=100%25&height=400&hl=en&q=Bangkok,%20Thailand+(Technician%20Location)&t=&z=12&ie=UTF8&iwloc=B&output=embed"
                ></iframe>
              </div>
            </div>

            <button
              onClick={() => setCurrentStep(2)}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
            >
              ถัดไป →
            </button>
          </div>
        )}

        {/* Step 2: Work Details */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3 pb-4 border-b">
                <Clock className="w-7 h-7 text-blue-600" />
                บันทึกผลการปฏิบัติงาน
              </h2>

              <div>
                <label className="block mb-3 text-base font-bold text-gray-700 flex items-center gap-2">
                  <span className="flex items-center justify-center w-7 h-7 bg-blue-600 text-white rounded-full text-sm">1</span>
                  รายละเอียดการเริ่ม/สิ้นสุดงาน
                </label>
                <input
                  type="text"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  placeholder="ตัวอย่าง: 10:00 - เริ่มติดตั้ง / 14:00 - จบงาน"
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 text-base"
                />
              </div>

              <div>
                <label className="block mb-3 text-base font-bold text-gray-700 flex items-center gap-2">
                  <span className="flex items-center justify-center w-7 h-7 bg-blue-600 text-white rounded-full text-sm">2</span>
                  วัสดุที่ใช้
                </label>
                <input
                  type="text"
                  name="materials"
                  value={formData.materials}
                  onChange={handleInputChange}
                  placeholder="ตัวอย่าง: สายไฟ VCT 2x1.5 (20 เมตร)"
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 text-base"
                />
              </div>

              <div>
                <label className="block mb-3 text-base font-bold text-gray-700 flex items-center gap-2">
                  <span className="flex items-center justify-center w-7 h-7 bg-blue-600 text-white rounded-full text-sm">3</span>
                  รายงานปัญหา/ข้อเสนอแนะ
                </label>
                <textarea
                  name="issues"
                  value={formData.issues}
                  onChange={handleInputChange}
                  rows="5"
                  placeholder="บันทึกปัญหาที่พบ หรือข้อเสนอแนะในการทำงาน"
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 text-base resize-none"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setCurrentStep(1)} className="flex-1 py-4 bg-gray-200 text-gray-700 rounded-xl font-bold text-lg hover:bg-gray-300 transition-all duration-300">← ย้อนกลับ</button>
              <button onClick={() => setCurrentStep(3)} className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300">ถัดไป →</button>
            </div>
          </div>
        )}

        {/* Step 3: Evidence Upload */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3 pb-4 border-b">
                <Camera className="w-7 h-7 text-blue-600" />
                หลักฐานการปฏิบัติงาน
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { field: 'beforeImage', label: 'รูปก่อนดำเนินการ', num: 4 },
                  { field: 'afterImage', label: 'รูปหลังดำเนินการ', num: 5 },
                  { field: 'otherImage', label: 'ลายเซ็นต์/หลักฐานลูกค้า', num: 6 }
                ].map(({ field, label, num }) => (
                  <div key={field} className="space-y-3">
                    <label className="block text-base font-bold text-gray-700 flex items-center gap-2">
                      <span className="flex items-center justify-center w-7 h-7 bg-blue-600 text-white rounded-full text-sm">{num}</span>
                      {label}
                    </label>
                    <div className="relative group">
                      <input type="file" accept="image/*" onChange={handleImageUpload(field)} className="hidden" id={field} />
                      <label htmlFor={field} className={`block w-full h-56 rounded-xl cursor-pointer flex flex-col items-center justify-center transition-all duration-300 border-2 border-dashed overflow-hidden ${formData[field] ? 'border-green-400 bg-green-50' : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'}`}>
                        {formData[field] ? (
                          <div className="relative w-full h-full">
                            <img src={formData[field]} alt={field} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                              <Upload className="w-10 h-10 text-white" />
                            </div>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-12 h-12 text-gray-400 mb-3 group-hover:text-blue-500 transition-colors" />
                            <span className="text-sm text-gray-600 font-medium text-center px-4">แตะเพื่ออัพโหลดรูปภาพ</span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setCurrentStep(2)} className="flex-1 py-4 bg-gray-200 text-gray-700 rounded-xl font-bold text-lg hover:bg-gray-300 transition-all duration-300">← ย้อนกลับ</button>
              <button onClick={() => setCurrentStep(4)} className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300">ถัดไป →</button>
            </div>
          </div>
        )}

        {/* Step 4: Review & Submit */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">

              <div className="flex justify-between items-center pb-4 border-b">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <CheckCircle className="w-7 h-7 text-green-600" />
                  ตรวจสอบข้อมูลก่อนส่ง
                </h2>
                {/* ปุ่ม Download PDF */}
                <button
                  onClick={downloadPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  <Download size={18} />
                  Download PDF
                </button>
              </div>

              {/* แก้ไข: ใช้ Inline Style (Hex Code) แทน Tailwind Class 
                  เพื่อแก้ปัญหา oklch color error ใน html2canvas 
              */}
              <div
                id="report-summary"
                className="space-y-4 p-6 rounded-xl border"
                style={{ backgroundColor: '#F9FAFB', borderColor: '#E5E7EB', color: '#111827' }}
              >
                {/* Header for PDF */}
                <div className="text-center mb-6 pb-4 border-b" style={{ borderColor: '#D1D5DB' }}>
                  <h3 className="text-xl font-bold" style={{ color: '#111827' }}>ใบรายงานการปฏิบัติงาน</h3>
                  <p style={{ color: '#6B7280' }}>รหัสงาน: JOB-{workDataFromCalendar.id}</p>
                  <p style={{ color: '#6B7280' }}>วันที่: {new Date().toLocaleDateString('th-TH')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <SummaryItem label="ชื่องาน" value={workDataFromCalendar.namework} />
                  <SummaryItem label="สถานที่" value={workDataFromCalendar.role} />
                  <SummaryItem label="ช่างผู้ปฏิบัติงาน" value={workDataFromCalendar.technicianName} />
                  <SummaryItem label="เวลาเริ่ม/เสร็จ" value={formData.startDate || '-'} />
                </div>

                <hr className="my-2" style={{ borderColor: '#E5E7EB' }} />

                <SummaryItem label="วัสดุที่ใช้" value={formData.materials || '-'} />
                <SummaryItem label="ปัญหา/ข้อเสนอแนะ" value={formData.issues || '-'} />

                <div className="grid grid-cols-3 gap-4 mt-6">
                  <ImagePreview label="ก่อนดำเนินการ" src={formData.beforeImage} />
                  <ImagePreview label="หลังดำเนินการ" src={formData.afterImage} />
                  <ImagePreview label="ลายเซ็นต์/หลักฐาน" src={formData.otherImage} />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setCurrentStep(3)}
                className="flex-1 py-4 bg-gray-200 text-gray-700 rounded-xl font-bold text-lg hover:bg-gray-300 transition-all duration-300"
              >
                ← ย้อนกลับ
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Send size={24} />
                ยืนยันส่งงาน
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Component ย่อย: ใช้ Style Inline สีพื้นฐานเพื่อความปลอดภัยในการ Print PDF
const InfoRow = ({ label, value, icon }) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
    <span className="text-gray-600 font-medium flex items-center gap-2">
      <span className="text-xl">{icon}</span>
      {label}
    </span>
    <span className="font-bold text-gray-900">{value}</span>
  </div>
);

const SummaryItem = ({ label, value }) => (
  <div className="pb-3 border-b last:border-b-0" style={{ borderColor: '#E5E7EB' }}>
    <div className="text-sm mb-1" style={{ color: '#4B5563' }}>{label}</div>
    <div className="font-semibold break-words" style={{ color: '#111827' }}>{value}</div>
  </div>
);

const ImagePreview = ({ label, src }) => (
  <div>
    <div className="text-xs mb-2 font-medium" style={{ color: '#4B5563' }}>{label}</div>
    <div className="w-full h-32 rounded-lg overflow-hidden border" style={{ backgroundColor: '#E5E7EB', borderColor: '#D1D5DB' }}>
      {src ? (
        <img src={src} alt={label} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-white" style={{ color: '#9CA3AF' }}>
          <span className="text-xs">ไม่มีรูปภาพ</span>
        </div>
      )}
    </div>
  </div>
);

export default JobPostingForm;