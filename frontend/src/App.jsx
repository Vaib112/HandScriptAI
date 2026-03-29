import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './App.css';
import Upload from './components/Upload';
import PrescriptionTable from './components/PrescriptionTable';
import PrescriptionModal from './components/PrescriptionModal';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthProvider, useAuth } from './context/AuthContext';

function Dashboard() {
  const [records, setRecords] = useState([]);
  const [modalRecord, setModalRecord] = useState(null);
  const { user, token, logout } = useAuth();
  
  // Fetch history directly from MySQL database through backend API
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('https://generous-charisma-production.up.railway.app/api/prescriptions', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setRecords(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch prescriptions:", err);
      }
    };
    if (token) fetchHistory();
  }, [token]);

  const handleUpload = (newRecord) => {
    // Add explicitly authenticated newly scanned record to the front
    setRecords(prev => [newRecord, ...prev]);
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to delete this prescription?")) return;
    try {
      const res = await fetch(`https://generous-charisma-production.up.railway.app/api/prescriptions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setRecords(prev => prev.filter(r => r.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  return (
    <div className="app-container">
      <header className="header dashboard-header">
        <div className="header-titles">
          <h1>MedScript Reader</h1>
          <p>AI-Powered Doctor's Prescription Decoder</p>
        </div>
        <div className="user-controls glass-panel">
          <span className="user-email">Logged in as: <strong>{user?.email}</strong></span>
          <button onClick={logout} className="btn-secondary logout-btn">Logout</button>
        </div>
      </header>

      <main>
        <Upload onUpload={handleUpload} token={token} />
        
        {records.length > 0 && (
          <div className="glass-panel table-container glass-animation">
            <h2 className="section-title-main">Your Secure Prescription History</h2>
            <PrescriptionTable 
              records={records} 
              onView={(record) => setModalRecord(record)} 
              onDelete={handleDelete} 
            />
          </div>
        )}
      </main>

      <PrescriptionModal 
        record={modalRecord} 
        onClose={() => setModalRecord(null)} 
      />
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) return null; // Or a spinner
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) return null;
  if (token) return <Navigate to="/" replace />;
  return children;
}

function App() {
  return (
    <>
      <Toaster 
        position="top-right" 
        toastOptions={{ 
          style: { background: '#333', color: '#fff' } 
        }} 
      />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
