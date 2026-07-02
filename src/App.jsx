import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HostPage from './pages/HostPage';
import RegistrationForm from './pages/RegistrationForm';
import Dashboard from './pages/Dashboard';
import Accommodation from './pages/Accommodation';
import Payments from './pages/Payments';
import CommitmentCeremony from './pages/CommitmentCeremony';
import HotelPage from './pages/HotelPage';
import Admin from './pages/Admin';
import DevoteeDetails from './pages/DevoteeDetails';
import Welcome from './pages/Welcome';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RegistrationForm />} />
        <Route path="/registration" element={<RegistrationForm />} />
        <Route path="/host" element={<HostPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/accommodation" element={<Accommodation />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/Payments" element={<Payments />} />
        <Route path="/commitment" element={<CommitmentCeremony />} />
        <Route path="/hotel" element={<HotelPage />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/devotee-details" element={<DevoteeDetails />} />
        <Route path="/welcome" element={<Welcome />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
