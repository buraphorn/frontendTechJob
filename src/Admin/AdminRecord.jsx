import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Button, Form, Dropdown, Table, Badge, InputGroup } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
// ดึงข้อมูลรายชื่อช่าง
import { getTechnicians } from '../data/dataCore';

const AdminRecord = ({ works, setWorks, tasks, setTasks }) => {

  // --- State ---
  const [show, setShow] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedWork, setSelectedWork] = useState(null);
  const [curPage, setCurPage] = useState(1);
  const itemsPerPage = 10;

  const [generatedId, setGeneratedId] = useState('');
  const [techniciansList, setTechniciansList] = useState([]);
  const [selectedWorkType, setSelectedWorkType] = useState('');

  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // --- Map ---
  const [showMap, setShowMap] = useState(false);
  const [mapLocation, setMapLocation] = useState({ lat: 13.7563, lng: 100.5018 });
  const [addressInput, setAddressInput] = useState('');

  // --- Filter ---
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // --- Ref (ตัวดึงค่าจากช่องกรอก) ---
  const nameWorkRef = useRef();
  const detailRef = useRef();
  const dateWorkRef = useRef();
  const timeStartRef = useRef();
  const timeEndRef = useRef();
  const nameCustomerRef = useRef();
  const moneyRef = useRef();
  const costRef = useRef(); // **เพิ่ม: ตัวดึงค่าต้นทุน**

  useEffect(() => {
    const techs = getTechnicians();
    setTechniciansList(techs);
  }, []);

  const generateNewId = () => {
    const year = new Date().getFullYear();
    const maxId = works.reduce((max, work) => {
      if (typeof work.id === 'string' && work.id.startsWith(`WJ-${year}-`)) {
        const num = parseInt(work.id.split('-')[2]);
        return num > max ? num : max;
      }
      return max;
    }, 0);
    const nextNum = String(maxId + 1).padStart(3, '0');
    return `WJ-${year}-${nextNum}`;
  };

  const handleClose = () => setShow(false);

  const handleShow = () => {
    setIsEditMode(false);
    setGeneratedId(generateNewId());
    setSelectedWorkType('');
    setAddressInput('');
    setMapLocation({ lat: 13.7563, lng: 100.5018 });
    setShow(true);
  };

  const handleEdit = (work) => {
    setIsEditMode(true);
    setEditingId(work.id);
    setGeneratedId(work.id);

    setSelectedWorkType(work.typework);
    setAddressInput(work.location?.address || work.role);
    setMapLocation(work.location || { lat: 13.7563, lng: 100.5018 });

    setShow(true);

    setTimeout(() => {
      if (nameWorkRef.current) nameWorkRef.current.value = work.namework;
      if (detailRef.current) detailRef.current.value = work.detail;
      if (dateWorkRef.current) dateWorkRef.current.value = work.datework;
      if (nameCustomerRef.current) nameCustomerRef.current.value = work.nameCustomer;

      // ดึงค่าเงินมาใส่
      if (moneyRef.current) moneyRef.current.value = work.money || '';
      // **ดึงค่าต้นทุนมาใส่ (ถ้ามี)**
      if (costRef.current) costRef.current.value = work.cost || '';

      if (work.time) {
        const [start, end] = work.time.split(' - ');
        if (timeStartRef.current) timeStartRef.current.value = start;
        if (timeEndRef.current) timeEndRef.current.value = end;
      }
    }, 100);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedWork(null);
  };
  const handleShowDetail = (work) => {
    setSelectedWork(work);
    setShowDetail(true);
  };

  // --- Map Functions ---
  const handleOpenMap = () => setShowMap(true);
  const handleCloseMap = () => setShowMap(false);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setMapLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      }, (error) => {
        alert("ไม่สามารถดึงตำแหน่งได้: " + error.message);
      });
    } else {
      alert("Browser ของคุณไม่รองรับ Geolocation");
    }
  };

  const handleSaveMapLocation = () => {
    if (!addressInput) {
      setAddressInput(`พิกัด: ${mapLocation.lat.toFixed(6)}, ${mapLocation.lng.toFixed(6)}`);
    }
    handleCloseMap();
  };

  // --- Save Logic ---
  const saveWork = () => {
    const namework = nameWorkRef.current.value.trim();
    const detail = detailRef.current.value.trim();
    const datework = dateWorkRef.current.value;
    const timeStart = timeStartRef.current.value;
    const timeEnd = timeEndRef.current.value;
    const nameCustomer = nameCustomerRef.current.value;
    const money = moneyRef.current.value;
    const cost = costRef.current.value; // **รับค่าต้นทุน**

    // เช็คว่ากรอกครบไหม (ถ้าต้นทุนไม่กรอก ให้ถือว่าเป็น 0 ได้ ไม่ต้องบังคับ)
    if (!namework || !selectedWorkType || !detail || !addressInput || !datework || !timeStart || !timeEnd || !nameCustomer || !money) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน (ยกเว้นต้นทุน สามารถระบุภายหลังได้)');
      return;
    }

    const workData = {
      namework: namework,
      typework: selectedWorkType,
      detail: detail,
      role: addressInput,
      assigneeId: null,
      technicianName: "รอจ่ายงาน",
      datework: datework,
      nameCustomer: nameCustomer,
      time: `${timeStart} - ${timeEnd}`,

      money: parseFloat(money),
      // **บันทึกต้นทุนลงระบบ** (ถ้าไม่กรอกให้เป็น 0)
      cost: parseFloat(cost) || 0,

      location: {
        address: addressInput,
        lat: mapLocation.lat,
        lng: mapLocation.lng
      },
      materials: [],
    };

    if (isEditMode) {
      setWorks(works.map(w => {
        if (w.id === editingId) {
          return { ...w, ...workData };
        }
        return w;
      }));
    } else {
      const newWork = {
        id: generatedId,
        ...workData,
        status: "Draft",
        completed: false,
      };
      setWorks([newWork, ...works]);
    }

    handleClose();
  };

  const handleSendToLeader = (id) => {
    if (window.confirm('ยืนยันการส่งใบงานนี้ให้หัวหน้างาน (Leader)?')) {
      setWorks(works.map(w => {
        if (w.id === id) {
          return { ...w, status: "Pending" };
        }
        return w;
      }));
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('ต้องการลบประวัติงานนี้ใช่หรือไม่?')) {
      setWorks(works.filter(work => work.id !== id));
    }
  };

  const filteredWorks = useMemo(() => {
    let filtered = works;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((work) => {
        return (
          (work.namework && work.namework.toLowerCase().includes(searchLower)) ||
          (work.nameCustomerm && work.nameCustomerm.toLowerCase().includes(searchLower)) ||
          (work.id && work.id.toString().includes(searchTerm))
        );
      });
    }
    if (selectedType) filtered = filtered.filter(work => work.typework === selectedType);

    if (selectedStatus) {
      if (selectedStatus === 'completed') filtered = filtered.filter(work => work.completed || work.status === 'Approved');
      else if (selectedStatus === 'inspection') filtered = filtered.filter(work => work.status === 'PendingInspection');
      else if (selectedStatus === 'revision') filtered = filtered.filter(work => work.status === 'Revision');
      else if (selectedStatus === 'assigned') filtered = filtered.filter(work => work.status === 'Assigned');
      else if (selectedStatus === 'pending') filtered = filtered.filter(work => !work.completed && work.status === 'Pending');
      else if (selectedStatus === 'draft') filtered = filtered.filter(work => work.status === 'Draft');
    }
    return filtered;
  }, [works, searchTerm, selectedType, selectedTime, selectedStatus]);

  useEffect(() => { setCurPage(1); }, [searchTerm, selectedType, selectedTime, selectedStatus]);

  const getStatusBadge = (work) => {
    if (work.status === 'Approved' || work.completed) return <Badge bg="success">เสร็จสิ้น (Approved)</Badge>;
    switch (work.status) {
      case 'Draft': return <Badge bg="secondary" text="light">ฉบับร่าง (Admin)</Badge>;
      case 'Pending': return <Badge bg="info" text="dark">รอจ่ายงาน (Leader)</Badge>;
      case 'Assigned': return <Badge bg="primary">มอบหมายแล้ว (ช่าง)</Badge>;
      case 'PendingInspection': return <Badge bg="warning" text="dark">รอตรวจสอบ (Leader)</Badge>;
      case 'Revision': return <Badge bg="danger">ส่งกลับแก้ไข</Badge>;
      default: return <Badge bg="light" text="dark">กำลังดำเนินการ</Badge>;
    }
  };

  const totalPages = Math.ceil(filteredWorks.length / itemsPerPage) || 1;
  const paginatedWorks = filteredWorks.slice((curPage - 1) * itemsPerPage, curPage * itemsPerPage);
  const goToFirst = () => setCurPage(1);
  const goToLast = () => setCurPage(totalPages);
  const goToNext = () => setCurPage(prev => Math.min(prev + 1, totalPages));
  const goToPrev = () => setCurPage(prev => Math.max(prev - 1, 1));

  const workTypes = [...new Set(works.map(work => work.typework))];
  const availableWorkTypes = [...new Set(techniciansList.map(t => t.typework))];
  const totalWorks = works.length;
  const completedWorks = works.filter(w => w.completed).length;
  const inProgressWorks = totalWorks - completedWorks;

  return (
    <div className="p-4" style={{ width: '100%', minHeight: '100vh', marginLeft: '14rem' }}>

      {/* --- Modal Add/Edit Work --- */}
      <Modal show={show} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-plus-circle me-2"></i>
            {isEditMode ? 'แก้ไขใบงาน (Edit Work Order)' : 'เพิ่มงานใหม่ (New Work Order)'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <div className="row">
              <div className="col-md-4">
                <Form.Group className="mb-3">
                  <Form.Label>รหัสใบงาน (Auto)</Form.Label>
                  <Form.Control value={generatedId} readOnly className="bg-light fw-bold text-primary" />
                </Form.Group>
              </div>
              <div className="col-md-8">
                <Form.Group className="mb-3">
                  <Form.Label>ชื่องาน <span className="text-danger">*</span></Form.Label>
                  <Form.Control ref={nameWorkRef} placeholder="ระบุชื่องาน" autoFocus />
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>ประเภทงาน <span className="text-danger">*</span></Form.Label>
                  <Form.Select value={selectedWorkType} onChange={(e) => setSelectedWorkType(e.target.value)}>
                    <option value="">-- เลือกประเภทงาน --</option>
                    {availableWorkTypes.map((type, i) => <option key={i} value={type}>{type}</option>)}
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>สถานะมอบหมาย</Form.Label>
                  <Form.Control value="รอส่งให้หัวหน้างาน (Leader)" readOnly className="bg-light text-muted" />
                </Form.Group>
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>รายละเอียดงาน <span className="text-danger">*</span></Form.Label>
              <Form.Control ref={detailRef} as="textarea" rows={3} placeholder="อธิบายรายละเอียด" />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>สถานที่ / จุดปักหมุด <span className="text-danger">*</span></Form.Label>
              <InputGroup>
                <Button variant="outline-danger" onClick={handleOpenMap}>
                  <i className="bi bi-geo-alt-fill me-1"></i> ปักหมุด
                </Button>
                <Form.Control
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                  placeholder="ระบุสถานที่ หรือ กดปักหมุดเพื่อระบุพิกัด"
                />
              </InputGroup>
              {mapLocation.lat !== 13.7563 && (
                <Form.Text className="text-muted">
                  <i className="bi bi-crosshair me-1"></i>
                  พิกัดที่เลือก: {mapLocation.lat.toFixed(6)}, {mapLocation.lng.toFixed(6)}
                </Form.Text>
              )}
            </Form.Group>

            <div className='d-flex'>
              <Form.Group className="mb-3 w-50 mr-2">
                <Form.Label>ชื่อลูกค้า <span className="text-danger">*</span></Form.Label>
                <Form.Control ref={nameCustomerRef} type="text" placeholder="ระบุชื่อลูกค้า" />
              </Form.Group>

              <Form.Group className="mb-3 w-25 mr-2">
                <Form.Label>งานมูลค่า (บาท) <span className="text-danger">*</span></Form.Label>
                <Form.Control ref={moneyRef} type="number" placeholder="รายรับ" />
              </Form.Group>

              {/* **เพิ่ม: ช่องกรอกต้นทุน** */}
              <Form.Group className="mb-3 w-25">
                <Form.Label>ต้นทุน (บาท)</Form.Label>
                <Form.Control ref={costRef} type="number" placeholder="รายจ่าย" className="border-danger" />
              </Form.Group>
            </div>

            <div className="row">
              <div className="col-md-4">
                <Form.Group className="mb-3">
                  <Form.Label>วันที่ <span className="text-danger">*</span></Form.Label>
                  <Form.Control ref={dateWorkRef} type="date" />
                </Form.Group>
              </div>
              <div className="col-md-4">
                <Form.Group className="mb-3">
                  <Form.Label>เวลาเริ่ม</Form.Label>
                  <Form.Control ref={timeStartRef} type="time" defaultValue="09:00" />
                </Form.Group>
              </div>
              <div className="col-md-4">
                <Form.Group className="mb-3">
                  <Form.Label>เวลาสิ้นสุด</Form.Label>
                  <Form.Control ref={timeEndRef} type="time" defaultValue="17:00" />
                </Form.Group>
              </div>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>ยกเลิก</Button>
          <Button variant="primary" onClick={saveWork}>
            <i className="bi bi-save me-2"></i>{isEditMode ? 'บันทึกการแก้ไข' : 'บันทึกใบงาน (Draft)'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* --- Modal Map Picker --- */}
      <Modal show={showMap} onHide={handleCloseMap} centered>
        <Modal.Header closeButton>
          <Modal.Title><i className="bi bi-map me-2"></i>ระบุตำแหน่งบนแผนที่</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-grid gap-2 mb-3">
            <Button variant="outline-primary" onClick={getCurrentLocation}>
              <i className="bi bi-cursor-fill me-2"></i> ดึงตำแหน่งปัจจุบันของฉัน
            </Button>
          </div>
          <div className="ratio ratio-4x3 border rounded mb-3 bg-light position-relative">
            <iframe
              src={`https://maps.google.com/maps?q=${mapLocation.lat},${mapLocation.lng}&z=15&output=embed`}
              title="Map Preview"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
            ></iframe>
          </div>
          <div className="row g-2">
            <div className="col-6">
              <Form.Label><small>ละติจูด (Lat)</small></Form.Label>
              <Form.Control
                type="number"
                value={mapLocation.lat}
                onChange={(e) => setMapLocation({ ...mapLocation, lat: parseFloat(e.target.value) })}
              />
            </div>
            <div className="col-6">
              <Form.Label><small>ลองจิจูด (Lng)</small></Form.Label>
              <Form.Control
                type="number"
                value={mapLocation.lng}
                onChange={(e) => setMapLocation({ ...mapLocation, lng: parseFloat(e.target.value) })}
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseMap}>ปิด</Button>
          <Button variant="primary" onClick={handleSaveMapLocation}>
            <i className="bi bi-check-lg me-2"></i> ยืนยันพิกัด
          </Button>
        </Modal.Footer>
      </Modal>

      {/* --- Modal Detail --- */}
      <Modal show={showDetail} onHide={handleCloseDetail} size="lg">
        <Modal.Header closeButton className="bg-light">
          <Modal.Title><i className="bi bi-file-earmark-text me-2"></i>รายละเอียดงาน</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedWork && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                <div>
                  <h5 className="mb-1">{selectedWork.namework}</h5>
                  <small className="text-muted">รหัส: {selectedWork.id}</small>
                </div>
                {getStatusBadge(selectedWork)}
              </div>
              <div className="row mb-3">
                <div className="col-md-6">
                  <p className="mb-1 text-muted"><small>ช่างผู้รับผิดชอบ</small></p>
                  <p className="fw-bold">{selectedWork.technicianName || '-'}</p>
                </div>
                <div className="col-md-6">
                  <p className="mb-1 text-muted"><small>ประเภทงาน</small></p>
                  <p className="fw-bold">{selectedWork.typework}</p>
                </div>
              </div>
              {/* แสดงเงินและต้นทุน */}
              <div className="row mb-3">
                <div className="col-md-6">
                  <p className="mb-1 text-muted"><small>มูลค่างาน (รายรับ)</small></p>
                  <p className="fw-bold text-success">
                    {selectedWork.money ? selectedWork.money.toLocaleString() : '0'} บาท
                  </p>
                </div>
                <div className="col-md-6">
                  <p className="mb-1 text-muted"><small>ต้นทุน (รายจ่าย)</small></p>
                  <p className="fw-bold text-danger">
                    {selectedWork.cost ? selectedWork.cost.toLocaleString() : '0'} บาท
                  </p>
                </div>
              </div>

              <p className="mb-1 text-muted"><small>สถานที่</small></p>
              <div className="alert alert-light border">
                <i className="bi bi-geo-alt text-danger me-2"></i>
                {selectedWork.role}
                {selectedWork.location && selectedWork.location.lat && (
                  <div className="mt-2 ratio ratio-21x9">
                    <iframe
                      src={`https://maps.google.com/maps?q=${selectedWork.location.lat},${selectedWork.location.lng}&z=15&output=embed`}
                      title="Work Location"
                      style={{ border: 0, borderRadius: '8px' }}
                      loading="lazy"
                    ></iframe>
                  </div>
                )}
              </div>
              <div>
                <p className="mb-1 text-muted me-5 "><small>รายละเอียด</small></p>
                <p className=''>{selectedWork.detail}</p>
              </div>
              <div className='d-flex justify-content-between'>
                <div>
                  <p className="mb-1 text-muted me-5"><small>ชื่อลูกค้า</small></p>
                  <p>{selectedWork.nameCustomer}</p>
                </div>
                <div>
                  <p className="mb-1 text-muted"><small>วันที่และเวลา</small></p>
                  <p>{selectedWork.datework}</p>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDetail}>ปิด</Button>
        </Modal.Footer>
      </Modal>

      {/* Header */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h3 className="mb-2"><i className="bi bi-file-text-fill me-2"></i>ระบบงาน</h3>
            <p className="text-muted mb-0">จัดการและติดตามประวัติการทำงานทั้งหมด</p>
          </div>
          <Button variant="primary" onClick={handleShow} size="m">
            <i className="bi bi-plus-circle me-2"></i>เพิ่มงานใหม่
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 p-3 rounded me-3"><i className="bi bi-list-check text-primary fs-4"></i></div>
                <div><small className="text-muted">งานทั้งหมด</small><h3 className="mb-0">{totalWorks}</h3></div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="bg-success bg-opacity-10 p-3 rounded me-3"><i className="bi bi-check-circle text-success fs-4"></i></div>
                <div><small className="text-muted">เสร็จสิ้น</small><h3 className="mb-0">{completedWorks}</h3></div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="bg-warning bg-opacity-10 p-3 rounded me-3"><i className="bi bi-clock-history text-warning fs-4"></i></div>
                <div><small className="text-muted">กำลังดำเนินการ</small><h3 className="mb-0">{inProgressWorks}</h3></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <Form.Control type="text" placeholder="🔍 ค้นหา..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="col-md-3">
              <Form.Select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                <option value="">ประเภททั้งหมด</option>
                {workTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </Form.Select>
            </div>
            <div className="col-md-3">
              <Form.Select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                <option value="">สถานะทั้งหมด</option>
                <option value="draft">ฉบับร่าง (ยังไม่ส่ง)</option>
                <option value="pending">รอจ่ายงาน (ส่งแล้ว)</option>
                <option value="assigned">มอบหมายแล้ว (กำลังทำ)</option>
                <option value="inspection">รอตรวจสอบ (ส่งงานแล้ว)</option>
                <option value="revision">ต้องแก้ไขงาน</option>
                <option value="completed">เสร็จสิ้น</option>
              </Form.Select>
            </div>
            <div className="col-md-3">
              <Form.Select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)}>
                <option value="">ช่วงเวลาทั้งหมด</option>
                <option value="1month">1 เดือนที่ผ่านมา</option>
                <option value="6months">6 เดือนที่ผ่านมา</option>
                <option value="1year">1 ปีที่ผ่านมา</option>
              </Form.Select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div style={{ height: '60vh', overflowY: 'auto' }}>
            <Table striped hover className="mb-0">
              <thead style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }} className="table-light">
                <tr className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th style={{ width: '120px' }}>รหัส</th>
                  <th>ชื่องาน</th>
                  <th>ประเภท</th>
                  <th>วันที่</th>
                  <th>รายละเอียด</th>
                  <th>สถานที่</th>
                  <th>สถานะ</th>
                  <th style={{ width: '100px' }}>จัดการ</th>
                </tr>
              </thead>
              <tbody className="text-center">
                {paginatedWorks.length > 0 ? (
                  paginatedWorks.map((work) => (
                    <tr key={work.id}>
                      <td><Badge bg="secondary">{work.id}</Badge></td>
                      <td className="text-start fw-semibold">{work.namework}</td>
                      <td><Badge bg="info" text="dark">{work.typework}</Badge></td>
                      <td>{new Date(work.datework).toLocaleDateString('th-TH')}</td>
                      <td className="text-start" style={{ maxWidth: '200px' }}>
                        <small className="text-muted">{work.detail.substring(0, 40) + '...'}</small>
                      </td>
                      <td className="text-start"><small>{work.role}</small></td>
                      <td>
                        {getStatusBadge(work)}
                      </td>
                      <td>
                        <Dropdown>
                          <Dropdown.Toggle variant="outline-secondary" size="sm"><i className="bi bi-three-dots"></i></Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item onClick={() => handleShowDetail(work)}>
                              <i className="bi bi-eye me-2 text-primary"></i>ดูรายละเอียด
                            </Dropdown.Item>

                            {!work.completed && (
                              <>
                                <Dropdown.Item onClick={() => handleEdit(work)}>
                                  <i className="bi bi-pencil me-2 text-warning"></i>แก้ไขข้อมูล
                                </Dropdown.Item>

                                {work.status === 'Draft' && (
                                  <Dropdown.Item onClick={() => handleSendToLeader(work.id)}>
                                    <i className="bi bi-send me-2 text-success"></i>ส่งให้ Leader
                                  </Dropdown.Item>
                                )}
                              </>
                            )}

                            <Dropdown.Divider />
                            <Dropdown.Item onClick={() => handleDelete(work.id)} className="text-danger"><i className="bi bi-trash me-2"></i>ลบ</Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="8" className="text-center text-muted py-5">ไม่พบข้อมูล</td></tr>
                )}
              </tbody>
            </Table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <div className="text-muted">แสดง {(curPage - 1) * itemsPerPage + 1} - {Math.min(curPage * itemsPerPage, filteredWorks.length)} จาก {filteredWorks.length} รายการ</div>
        <div>
          <Button variant="outline-primary" onClick={goToFirst} disabled={curPage === 1} size="sm" className="me-1"><i className="bi bi-chevron-bar-left"></i></Button>
          <Button variant="outline-primary" onClick={goToPrev} disabled={curPage === 1} size="sm" className="me-2"><i className="bi bi-chevron-left"></i></Button>
          <span className="mx-2">หน้า <strong>{curPage}</strong> / {totalPages}</span>
          <Button variant="outline-primary" onClick={goToNext} disabled={curPage === totalPages} size="sm" className="ms-2"><i className="bi bi-chevron-right"></i></Button>
          <Button variant="outline-primary" onClick={goToLast} disabled={curPage === totalPages} size="sm" className="ms-1"><i className="bi bi-chevron-bar-right"></i></Button>
        </div>
      </div>
    </div>
  );
};

export default AdminRecord;