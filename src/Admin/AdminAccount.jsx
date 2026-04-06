import { Form, Button, Dropdown, Badge, Modal, Table, Row, Col, InputGroup } from 'react-bootstrap';
import { useState, useEffect, useRef, useMemo } from 'react';
import { getAllEmployees } from '../data/dataCore';

const AdminAccount = () => {
  const [users, setUsers] = useState([]);
  const [curPage, setCurPage] = useState(1);
  const itemsPerPage = 10;

  const [show, setShow] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // --- Image Handling ---
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // --- Refs (สร้างตัวแปรสำหรับดึงค่าจากฟอร์มทุกช่อง) ---
  const nameRef = useRef();
  const nicknameRef = useRef();
  const birthdayRef = useRef();
  const phoneRef = useRef();
  const emailRef = useRef();
  const typeWorkRef = useRef();
  const expertiseRef = useRef();
  const incomeRef = useRef();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const handleClose = () => {
    setShow(false);
    setEditMode(false);
    setEditingUser(null);
    setImagePreview(null);
  };
  const handleShow = () => setShow(true);

  // โหลดข้อมูลครั้งเดียวตอน mount
  useEffect(() => {
    setUsers(getAllEmployees());
  }, []);

  // --- useEffect: ดึงข้อมูลมาใส่ฟอร์มเมื่อกดแก้ไข ---
  useEffect(() => {
    if (show && editMode && editingUser) {
      setTimeout(() => {
        if (nameRef.current) nameRef.current.value = editingUser.name || '';
        if (nicknameRef.current) nicknameRef.current.value = editingUser.nickname || '';
        if (birthdayRef.current) birthdayRef.current.value = editingUser.birthday || '';
        if (phoneRef.current) phoneRef.current.value = editingUser.phone || '';
        if (emailRef.current) emailRef.current.value = editingUser.email || '';
        if (typeWorkRef.current) typeWorkRef.current.value = editingUser.typework || '';
        if (expertiseRef.current) expertiseRef.current.value = editingUser.expertise || '';
        if (incomeRef.current) incomeRef.current.value = editingUser.income || '';
        
        if (editingUser.profileImage) setImagePreview(editingUser.profileImage);
      }, 100);
    } else if (show && !editMode) {
       setImagePreview(null);
    }
  }, [show, editMode, editingUser]);

  // ใช้ useMemo แทน useEffect เพื่อ filter ข้อมูล
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchLower = searchTerm.toLowerCase();
      const matchSearch = !searchTerm ||
        (user.name && user.name.toLowerCase().includes(searchLower)) ||
        (user.income && user.income.toString().includes(searchLower)) ||
        (user.typework && user.typework.toLowerCase().includes(searchLower)) ||
        (user.id && user.id.toString().includes(searchTerm));

      const matchType = !filterType || user.typework === filterType;
      const matchStatus = !filterStatus || user.status === filterStatus;

      return matchSearch && matchType && matchStatus;
    });
  }, [users, searchTerm, filterType, filterStatus]);

  useEffect(() => { setCurPage(1); }, [searchTerm, filterType, filterStatus]);

  const handleEdit = (id) => {
    const user = users.find(u => u.id === id);
    if (user) {
      setEditingUser(user);
      setEditMode(true);
      setShow(true);
    }
  };

  const handleDelete = (id) => {
    if(window.confirm('คุณต้องการลบรายชื่อนี้ใช่หรือไม่?')) {
        setUsers(users.filter(user => user.id !== id));
    }
  };

  // --- Logic บันทึกข้อมูล ---
  const saveClicked = () => {
    const name = nameRef.current.value.trim();
    const nickname = nicknameRef.current.value.trim();
    const birthday = birthdayRef.current.value;
    const phone = phoneRef.current.value.trim();
    const email = emailRef.current.value.trim();
    const typework = typeWorkRef.current.value;
    const expertise = expertiseRef.current.value.trim();
    const income = parseFloat(incomeRef.current.value) || 0;

    if (!name) { alert('กรุณากรอกชื่อช่าง'); return; }
    if (income <= 0) { alert('กรุณากรอกรายได้ที่ถูกต้อง'); return; }
    if (!typework) { alert('กรุณาเลือกประเภทงาน'); return; }

    const userData = {
        name, nickname, birthday, phone, email, typework, expertise, income,
        profileImage: imagePreview
    };

    if (editMode && editingUser) {
      // แก้ไข
      setUsers(users.map(user =>
        user.id === editingUser.id
          ? { ...user, ...userData }
          : user
      ));
    } else {
      // เพิ่มใหม่ (ตั้งค่าเริ่มต้นสถานะเป็น "ว่าง")
      const newUser = {
        id: users.reduce((prev, user) => (user.id > prev ? user.id : prev), 0) + 1,
        ...userData,
        status: 'ว่าง' 
      };
      setUsers([newUser, ...users]);
    }
    handleClose();
  };

  // --- Logic เลือกสีป้ายสถานะ (Badge) ---
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'ว่าง': return 'success';       // เขียว
      case 'กำลังทำงาน': return 'primary'; // ฟ้า/น้ำเงิน
      // case 'มา': return 'warning';        // เหลือง/ส้ม
      case 'ลา': return 'danger';         // แดง
      default: return 'secondary';        // เทา
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const goToFirst = () => setCurPage(1);
  const goToLast = () => setCurPage(totalPages);
  const goToNext = () => setCurPage(prev => Math.min(prev + 1, totalPages));
  const goToPrev = () => setCurPage(prev => Math.max(prev - 1, 1));

  // Stat Calculations
  const totalWork = users.length;
  const totalIncome = users.reduce((sum, user) => sum + user.income, 0);
  const totalPresent = users.filter(user => user.status === 'กำลังทำงาน' || user.status === 'มา' || user.status === 'ว่าง').length;

  const paginatedUsers = filteredUsers.slice((curPage - 1) * itemsPerPage, curPage * itemsPerPage);

  return (
    <div className="p-4" style={{ width: '100%', minHeight: '100vh', marginLeft: '14rem' }}>
      
      {/* Modal Form */}
      <Modal show={show} onHide={handleClose} size="lg" centered backdrop="static">
        <Modal.Header closeButton className="bg-light border-0">
          <Modal.Title className="fw-bold text-primary">
            <i className={`bi ${editMode ? 'bi-pencil-square' : 'bi-person-plus-fill'} me-2`}></i>
            {editMode ? 'แก้ไขข้อมูลพนักงาน' : 'ลงทะเบียนช่างใหม่'}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="px-4 py-4">
          <Form>
            <div className="d-flex justify-content-end mb-3">
              <Badge bg="secondary" className="p-2 px-3 fw-normal" style={{ fontSize: '0.9rem' }}>
                ID: {editMode ? editingUser.id : users.reduce((prev, user) => user.id > prev ? user.id : prev, 0) + 1}
              </Badge>
            </div>

            <Row>
              <Col md={6} className="border-end pe-md-4">
                <div className="d-flex flex-column align-items-center mb-4">
                  <div
                    className="rounded-circle bg-light border border-2 border-dashed d-flex align-items-center justify-content-center position-relative"
                    style={{ width: '120px', height: '120px', cursor: 'pointer', overflow: 'hidden' }}
                    onClick={() => fileInputRef.current.click()}
                  >
                    {imagePreview ? (
                        <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <div className="text-center text-muted">
                            <i className="bi bi-camera-fill fs-3"></i>
                            <div style={{ fontSize: '0.7rem' }}>เลือกรูป</div>
                        </div>
                    )}
                  </div>
                  <Form.Control
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={(e) => {
                        const file = e.target.files[0];
                        if(file) setImagePreview(URL.createObjectURL(file));
                    }}
                  />
                  <div className="text-primary mt-2 small" style={{ cursor: 'pointer' }} onClick={() => fileInputRef.current.click()}>
                    เปลี่ยนรูปโปรไฟล์
                  </div>
                </div>
                <Row className="mb-3">
                  <Col sm={8}>
                    <Form.Label>ชื่อ-นามสกุล <span className="text-danger">*</span></Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-white text-muted"><i className="bi bi-person"></i></InputGroup.Text>
                      <Form.Control ref={nameRef} placeholder="ชื่อจริง นามสกุล" autoFocus />
                    </InputGroup>
                  </Col>
                  <Col sm={4}>
                    <Form.Label>ชื่อเล่น</Form.Label>
                    <Form.Control ref={nicknameRef} placeholder="ชื่อเล่น" />
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>วันเกิด</Form.Label>
                  <Form.Control type='date' ref={birthdayRef} />
                </Form.Group>

                <Row className="mb-3">
                  <Col sm={6}>
                    <Form.Label>เบอร์โทร</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-white text-muted"><i className="bi bi-telephone"></i></InputGroup.Text>
                      <Form.Control ref={phoneRef} placeholder="0xx-xxx-xxxx" />
                    </InputGroup>
                  </Col>
                  <Col sm={6}>
                    <Form.Label>Email</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-white text-muted"><i className="bi bi-envelope"></i></InputGroup.Text>
                      <Form.Control ref={emailRef} placeholder="name@email.com" />
                    </InputGroup>
                  </Col>
                </Row>
              </Col>

              <Col md={6} className="ps-md-4 mt-4 mt-md-0">
                <h6 className="text-muted mb-3 text-uppercase fw-bold">ข้อมูลการทำงาน</h6>
                <Form.Group className="mb-3">
                  <Form.Label>ตำแหน่ง <span className="text-danger">*</span></Form.Label>
                  <Form.Select ref={typeWorkRef}>
                    <option value="">-- เลือกประเภท --</option>
                    <option value="ช่างไฟฟ้า">ช่างไฟฟ้า</option>
                    <option value="ช่างประปา">ช่างประปา</option>
                    <option value="ช่างทาสี">ช่างทาสี</option>
                    <option value="ช่างแอร์">ช่างแอร์</option>
                    <option value="ช่างหลังคา">ช่างหลังคา</option>
                    <option value="ช่างช่างทั่วไป">ช่างช่างทั่วไป</option>
                    <option value="ช่างลิฟต์">ช่างลิฟต์</option>
                    <option value="ช่าง IT">ช่าง IT</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>ความเชี่ยวชาญพิเศษ</Form.Label>
                  <Form.Control as="textarea" rows={2} ref={expertiseRef} placeholder="เช่น เดินสายไฟโรงงาน, ซ่อมท่อเมน" />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>อัตราจ้าง / เงินเดือน <span className="text-danger">*</span></Form.Label>
                    <InputGroup>
                        <InputGroup.Text className="bg-white text-success fw-bold">฿</InputGroup.Text>
                        <Form.Control ref={incomeRef} type='number' placeholder="0.00" />
                    </InputGroup>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer className="bg-light border-0">
          <Button variant="light" onClick={handleClose}>ยกเลิก</Button>
          <Button variant="primary" onClick={saveClicked}><i className="bi bi-save me-2"></i>บันทึกข้อมูล</Button>
        </Modal.Footer>
      </Modal>

      <h3 className="mb-2">
        <i className="bi bi-person-badge-fill me-2 text-primary"></i>
        จัดการบัญชีช่าง
      </h3>
      <p className="text-muted mb-4">จัดการรายชื่อ ข้อมูล และสถานะพนักงานช่าง</p>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 p-3 rounded me-3"><i className="bi bi-people-fill text-primary fs-4"></i></div>
                <div><small className="text-muted">ช่างทั้งหมด</small><h3 className="mb-0">{totalWork}</h3></div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="bg-danger bg-opacity-10 p-3 rounded me-3"><i className="bi bi-cash-coin text-danger fs-4"></i></div>
                <div><small className="text-muted">รายจ่ายเงินเดือนรวม</small><h3 className="mb-0">฿{totalIncome.toLocaleString()}</h3></div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="bg-success bg-opacity-10 p-3 rounded me-3"><i className="bi bi-person-check-fill text-success fs-4"></i></div>
                <div><small className="text-muted">พร้อมทำงาน (ว่าง)</small><h3 className="mb-0">{totalPresent}</h3></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body">
            <div className="row g-3">
                <div className="col-md-4">
                    <Form.Control type="text" placeholder="🔍 ค้นหาชื่อ, รหัส..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="col-md-3">
                    <Form.Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                    <option value="">ประเภททั้งหมด</option>
                    <option value="ช่างไฟฟ้า">ช่างไฟฟ้า</option>
                    <option value="ช่างประปา">ช่างประปา</option>
                    <option value="ช่างทาสี">ช่างทาสี</option>
                    <option value="ช่างแอร์">ช่างแอร์</option>
                    <option value="ช่าง IT">ช่าง IT</option>
                    </Form.Select>
                </div>
                <div className="col-md-3">
                    <Form.Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="">สถานะทั้งหมด</option>
                    <option value="ว่าง">ว่าง (พร้อมทำงาน)</option>
                    <option value="กำลังทำงาน">กำลังทำงาน</option>
                    {/* <option value="มา">มา</option> */}
                    <option value="ลา">ลา</option>
                    </Form.Select>
                </div>
                <div className="col-md-2 text-end">
                    <Button variant="primary" className="w-100" onClick={handleShow}>
                        <i className="bi bi-plus-lg me-1"></i> เพิ่มรายชื่อ
                    </Button>
                </div>
            </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div style={{ height: '60vh', overflowY: 'auto' }}>
            <Table striped hover className="mb-0">
              <thead style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }} className="table-light">
                <tr className="text-center">
                  <th style={{ width: '150px' }}>รหัสพนักงาน</th>
                  <th className="text-start ps-4">ชื่อ - นามสกุล</th>
                  <th>ประเภท</th>
                  <th>รายได้/เดือน</th>
                  <th>สถานะ</th>
                  <th style={{ width: '100px' }}>จัดการ</th>
                </tr>
              </thead>
              <tbody className="text-center align-middle">
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map(user => (
                    <tr key={user.id}>
                      <td><Badge bg="secondary">{user.id}</Badge></td>
                      <td className="text-start ps-4 fw-semibold">
                          <div className="d-flex align-items-center gap-2">
                             {user.profileImage ? (
                                 <img src={user.profileImage} alt="" className="rounded-circle border" style={{width:'32px', height:'32px', objectFit:'cover'}} />
                             ) : (
                                 <div className="rounded-circle bg-light border d-flex align-items-center justify-content-center text-secondary" style={{width:'32px', height:'32px'}}>
                                     <i className="bi bi-person-fill"></i>
                                 </div>
                             )}
                             {user.name}
                          </div>
                      </td>
                      <td><Badge bg="info" text="dark" className="rounded-pill px-3">{user.typework}</Badge></td>
                      <td className="fw-bold text-success">฿{user.income.toLocaleString()}</td>
                      <td>
                        <Badge bg={getStatusBadgeVariant(user.status)} pill>
                          {user.status}
                        </Badge>
                      </td>
                      <td>
                        <Dropdown>
                          <Dropdown.Toggle variant="outline-secondary" size="sm" id={`dropdown-${user.id}`}>
                            <i className="bi bi-three-dots"></i>
                          </Dropdown.Toggle>

                          <Dropdown.Menu>
                            <Dropdown.Item onClick={() => handleEdit(user.id)}>
                              <i className="bi bi-pencil-square me-2 text-warning"></i>แก้ไข
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item onClick={() => handleDelete(user.id)} className="text-danger">
                              <i className="bi bi-trash me-2"></i>ลบ
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-5">
                      <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                      ไม่พบข้อมูล
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <div className="text-muted">
            แสดง {(curPage - 1) * itemsPerPage + 1} - {Math.min(curPage * itemsPerPage, filteredUsers.length)} จาก {filteredUsers.length} รายการ
        </div>
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

export default AdminAccount;