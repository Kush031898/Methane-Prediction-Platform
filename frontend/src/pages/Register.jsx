// Register.jsx
import { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import toast from 'react-hot-toast'

const Register = () => {
    const { register } = useContext(AuthContext)
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isRegistering, setIsRegistering] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (password !== confirmPassword) {
            toast.error("Passwords do not match!")
            return
        }

        setIsRegistering(true)
        try {
            await register(firstName, lastName, username, password, confirmPassword)
            toast.success("Account created successfully!")
            navigate('/')
        } catch (err) {
            toast.error(err.response?.data?.detail || "Failed to register")
        }
        setIsRegistering(false)
    }

    return (
        <div className="auth-container fade-in">
            <div className="auth-card glass-panel" style={{padding: '2.5rem 2rem', maxWidth: '450px'}}>
                <div style={{display: 'flex', justifyContent: 'center', marginBottom: '1rem'}}>
                    <div style={{background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '50%'}}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--secondary-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                    </div>
                </div>
                <h2 style={{textAlign: 'center', marginBottom:'2rem'}} className="gradient-text">Create Account</h2>
                
                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                        <label>First Name</label>
                        <input className="form-control" type="text" required
                            placeholder="John"
                            value={firstName} onChange={e => setFirstName(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>Last Name</label>
                        <input className="form-control" type="text" required
                            placeholder="Doe"
                            value={lastName} onChange={e => setLastName(e.target.value)} />
                    </div>
                    <div className="form-group" style={{gridColumn: 'span 2'}}>
                        <label>Username</label>
                        <input className="form-control" type="text" required
                            placeholder="Choose a username"
                            value={username} onChange={e => setUsername(e.target.value)} />
                    </div>
                    <div className="form-group" style={{gridColumn: 'span 2'}}>
                        <label>Password</label>
                        <input className="form-control" type="password" required
                            placeholder="Create a password"
                            value={password} onChange={e => setPassword(e.target.value)} />
                    </div>
                    <div className="form-group" style={{gridColumn: 'span 2', marginBottom: '1rem'}}>
                        <label>Confirm Password</label>
                        <input className="form-control" type="password" required
                            placeholder="Confirm your password"
                            value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                    </div>
                    
                    <button type="submit" className="btn" disabled={isRegistering} style={{gridColumn: 'span 2', height: '48px'}}>
                        {isRegistering ? (
                            <><span className="spinner"></span> Registering...</>
                        ) : 'Create Account'}
                    </button>
                </form>
                <div style={{textAlign: 'center', marginTop: '2rem'}}>
                    <span style={{color: 'var(--text-muted)'}}>Already have an account? </span>
                    <Link to="/login" className="link-text">Sign In</Link>
                </div>
            </div>
        </div>
    )
}

export default Register
