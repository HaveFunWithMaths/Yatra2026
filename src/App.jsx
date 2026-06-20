import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HostPage from './pages/HostPage';
import RegistrationForm from './pages/RegistrationForm';
import Dashboard from './pages/Dashboard';
import Accommodation from './pages/Accommodation';
import Accounts from './pages/Accounts';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HostPage />} />
        <Route path="/registration" element={<RegistrationForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/accommodation" element={<Accommodation />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/Accounts" element={<Accounts />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
