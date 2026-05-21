// Login.jsx
import { useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import toast from 'react-hot-toast'

const Login = () => {
    const { login } = useContext(AuthContext)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [isLoggingIn, setIsLoggingIn] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoggingIn(true)
        try {
            await login(username, password)
            toast.success("Successfully logged in!")
        } catch (err) {
            toast.error(err.response?.data?.detail || "Invalid credentials")
        }
        setIsLoggingIn(false)
    }

    return (
        <div className="auth-container fade-in">
            <div className="auth-card glass-panel" style={{padding: '2.5rem 2rem'}}>
                <div style={{display: 'flex', justifyContent: 'center', marginBottom: '1rem'}}>
                    <div style={{background: 'rgba(14, 165, 233, 0.1)', padding: '1rem', borderRadius: '50%'}}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                    </div>
                </div>
                <h2 style={{textAlign: 'center', marginBottom:'2rem'}} className="gradient-text">Welcome Back</h2>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Username</label>
                        <input className="form-control" type="text" required
                            placeholder="Enter your username"
                            value={username} onChange={e => setUsername(e.target.value)} />
                    </div>
                    <div className="form-group" style={{marginBottom: '2rem'}}>
                        <label>Password</label>
                        <input className="form-control" type="password" required
                            placeholder="Enter your password"
                            value={password} onChange={e => setPassword(e.target.value)} />
                    </div>
                    <button type="submit" className="btn" disabled={isLoggingIn} style={{height: '48px'}}>
                        {isLoggingIn ? (
                            <><span className="spinner"></span> Authenticating...</>
                        ) : 'Sign In'}
                    </button>
                </form>
                <div style={{textAlign: 'center', marginTop: '2rem'}}>
                    <span style={{color: 'var(--text-muted)'}}>New User? </span>
                    <Link to="/register" className="link-text">Create Account</Link>
                </div>
            </div>
        </div>
    )
}

export default Login
