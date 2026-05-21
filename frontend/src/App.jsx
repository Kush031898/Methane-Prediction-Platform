import { useContext } from 'react'
import { Routes, Route, Link, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthContext } from './context/AuthContext'
import Dashboard from './pages/Dashboard'
import History from './pages/History'
import Login from './pages/Login'
import Register from './pages/Register'
import './App.css'

function App() {
  const { user, logout, loading } = useContext(AuthContext)

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
              <Link to="/history" className="nav-link">History</Link>
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
          <Route path="/history" element={user ? <History /> : <Navigate to="/login" />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
        </Routes>
      </main>
    </>
  )
}

export default App
