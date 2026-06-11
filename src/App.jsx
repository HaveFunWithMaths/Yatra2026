import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HostPage from './pages/HostPage';
import RegistrationForm from './pages/RegistrationForm';
import Dashboard from './pages/Dashboard';
import Accommodation from './pages/Accommodation';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HostPage />} />
        <Route path="/registration" element={<RegistrationForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/accommodation" element={<Accommodation />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
