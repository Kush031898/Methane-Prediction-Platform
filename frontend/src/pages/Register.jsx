// Register.jsx
import { useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

const Register = () => {
    const { register } = useContext(AuthContext)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState('user')
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await register(username, password, role)
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to register")
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-card glass-panel">
                <h2 style={{textAlign: 'center', marginBottom:'1.5rem'}} className="gradient-text">Create Account</h2>
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
                    <div className="form-group">
                        <label>Select Role</label>
                        <select className="form-control" value={role} onChange={e => setRole(e.target.value)}>
                            <option value="user">User</option>
                            <option value="admin">Administrator</option>
                        </select>
                    </div>
                    <button type="submit" className="btn" style={{marginTop:'1rem'}}>REGISTER</button>
                </form>
                <div style={{textAlign: 'center', marginTop: '1.5rem'}}>
                    <span style={{color: 'var(--text-muted)'}}>Already have an account? </span>
                    <Link to="/login" className="link-text">Login</Link>
                </div>
            </div>
        </div>
    )
}

export default Register
