import { useContext, useEffect } from 'react'
import { Routes, Route, Link, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthContext } from './context/AuthContext'
import Dashboard from './pages/Dashboard'
import Reports from './pages/Reports'
import Login from './pages/Login'
import Register from './pages/Register'
import './App.css'

function App() {
  const { user, logout, loading } = useContext(AuthContext)

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Calculate percentage positions
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      
      // Update global CSS variables for the background glow
      document.documentElement.style.setProperty('--mouse-x', `${x}%`);
      document.documentElement.style.setProperty('--mouse-y', `${y}%`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (loading) {
    return <div className="loading-screen">Loading...</div>
  }

  return (
    <>
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: 'var(--panel-bg)',
            color: 'var(--text-primary)',
            border: '1px solid var(--panel-border)',
            backdropFilter: 'blur(12px)',
          },
          success: {
            iconTheme: {
              primary: 'var(--secondary-color)',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: 'var(--danger-color)',
              secondary: '#fff',
            },
          },
        }} 
      />
      
      <nav className="navbar glass-panel">
        <div className="nav-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <img src="/methane.png" alt="MethaneML Logo" style={{ width: '28px', height: '28px' }} />
          <span className="gradient-text" style={{fontWeight: 'bold', fontSize: '1.2rem'}}>MethaneML</span>
        </div>
        <div className="nav-links">
          {user ? (
            <>
              <Link to="/" className="nav-link">Dashboard</Link>
              <Link to="/reports" className="nav-link">Reports</Link>
              <div className="user-profile">
                <span className="username">Hello, {user.first_name || user.username}</span>
                <button onClick={logout} className="btn-sm btn-outline">Logout</button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link btn-sm">Register</Link>
            </>
          )}
        </div>
      </nav>

      <main className="main-content">
        <Routes>
          <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/reports" element={user ? <Reports /> : <Navigate to="/login" />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
        </Routes>
      </main>
    </>
  )
}

export default App
