// Login.jsx
import { useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

const Login = () => {
    const { login } = useContext(AuthContext)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await login(username, password)
        } catch (err) {
            setError(err.response?.data?.detail || "Invalid credentials")
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-card glass-panel">
                <h2 style={{textAlign: 'center', marginBottom:'1.5rem'}} className="gradient-text">Sign In</h2>
                {error && <div className="error-text">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Username</label>
                        <input className="form-control" type="text" required
                            value={username} onChange={e => setUsername(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input className="form-control" type="password" required
                            value={password} onChange={e => setPassword(e.target.value)} />
                    </div>
                    <button type="submit" className="btn" style={{marginTop:'1rem'}}>LOGIN</button>
                </form>
                <div style={{textAlign: 'center', marginTop: '1.5rem'}}>
                    <span style={{color: 'var(--text-muted)'}}>New User? </span>
                    <Link to="/register" className="link-text">Create Account</Link>
                </div>
            </div>
        </div>
    )
}

export default Login
