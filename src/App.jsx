import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HostPage from './pages/HostPage';
import RegistrationForm from './pages/RegistrationForm';
import Dashboard from './pages/Dashboard';
import Accommodation from './pages/Accommodation';
import Accounts from './pages/Accounts';
import CommitmentCeremony from './pages/CommitmentCeremony';

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
        <Route path="/commitment" element={<CommitmentCeremony />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
