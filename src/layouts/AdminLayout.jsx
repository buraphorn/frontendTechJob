import { Outlet } from 'react-router-dom';
import AppNavbar from "../Menu/AppNavbar"



const AdminLayout = ({ onLogout }) => {

  return (
    <div className="d-flex mx-auto " style={{ width: '100%', height: '100vh' }}>
      {/* <AppHeader /> */}
      <AppNavbar onLogout={onLogout} />
      <Outlet />
      {/* <AppFooter /> */}
    </div>
  );
}

export default AdminLayout;
