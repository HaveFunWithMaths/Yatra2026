import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HostPage from './pages/HostPage';
import RegistrationForm from './pages/RegistrationForm';
import Dashboard from './pages/Dashboard';
import Accommodation from './pages/Accommodation';
import Payments from './pages/Payments';
import CommitmentCeremony from './pages/CommitmentCeremony';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HostPage />} />
        <Route path="/registration" element={<RegistrationForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/accommodation" element={<Accommodation />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/Payments" element={<Payments />} />
        <Route path="/commitment" element={<CommitmentCeremony />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
