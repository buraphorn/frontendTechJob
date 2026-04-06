import React from 'react';
import { Outlet } from 'react-router-dom';
import AppNavbar from '../Menu/AppNavbar';
function AppLayout({ onLogout , works, setWorks , tasks , setTasks}) {

  return (
    <div>
      <AppNavbar onLogout={onLogout} works={works} setWorks={setWorks} tasks={tasks}  setTasks={setTasks}/>
      <Outlet />
    </div>
  );
}

export default AppLayout;
