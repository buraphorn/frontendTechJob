import { Outlet } from 'react-router-dom';
import ManagerNavbar from "../Menu/ManagerNavbar"

const ManagerLayout = ({ onLogout }) => {

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* <AppHeader /> */}
      <ManagerNavbar onLogout={onLogout} />
      <Outlet />
      {/* <AppFooter /> */}
    </div>
  );
}

export default ManagerLayout;
