// History.jsx
import { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

const History = () => {
    const { api, user } = useContext(AuthContext)
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await api.get('/predict/history')
                setLogs(res.data)
            } catch (err) {
                console.error("Failed to fetch history")
            }
            setLoading(false)
        }
        fetchHistory()
    }, [api])

    const [visibleCount, setVisibleCount] = useState(3)

    if (loading) return <div className="glass-panel" style={{textAlign: 'center'}}>Loading...</div>

    const visibleLogs = logs.slice(0, visibleCount)

    return (
        <div className="glass-panel" style={{overflowX: 'auto'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem'}}>
                <h3 className="gradient-text">Prediction History</h3>
                <span style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>
                    Displaying {visibleLogs.length} of {logs.length} previous records
                </span>
            </div>
            
            {logs.length === 0 ? (
                <p style={{color: 'var(--text-muted)', textAlign: 'center'}}>No prediction logs found.</p>
            ) : (
                <>
                    <table className="data-table">
                        <thead>
                            <tr>
                                {user.role === 'admin' && <th>User ID</th>}
                                <th>Date</th>
                                <th>COD</th>
                                <th>pH</th>
                                <th>Temp</th>
                                <th>HRT</th>
                                <th>Predicted Yield</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleLogs.map((log, index) => (
                                <tr key={log._id || index}>
                                    {user.role === 'admin' && <td>#{log.user_id || log.user_username}</td>}
                                    <td>{new Date(log.timestamp).toLocaleDateString()}</td>
                                    <td>{log.cod?.toFixed(1)}</td>
                                    <td>{log.ph}</td>
                                    <td>{log.temperature}°C</td>
                                    <td>{log.hrt}d</td>
                                    <td style={{fontWeight: 'bold', color: 'var(--primary-color)'}}>
                                        {log.predicted_methane?.toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    {logs.length > 3 && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', gap: '1rem' }}>
                            {visibleCount > 3 && (
                                <button 
                                    onClick={() => setVisibleCount(3)}
                                    style={{ 
                                        width: 'auto', 
                                        padding: '0.6rem 1.5rem', 
                                        fontSize: '0.9rem', 
                                        backgroundColor: 'transparent', 
                                        color: 'var(--primary-color)', 
                                        border: '1px solid var(--primary-color)',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        transition: 'all 0.3s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)'
                                        e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.1)'
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)'
                                        e.currentTarget.style.backgroundColor = 'transparent'
                                    }}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="15 18 9 12 15 6"></polyline>
                                    </svg>
                                    See Less
                                </button>
                            )}

                            {visibleCount < logs.length && (
                                <button 
                                    onClick={() => setVisibleCount(prev => prev + 5)}
                                    style={{ 
                                        width: 'auto', 
                                        padding: '0.6rem 1.5rem', 
                                        fontSize: '0.9rem', 
                                        backgroundColor: 'var(--primary-color)', 
                                        color: '#fff', 
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 4px 15px rgba(16, 185, 129, 0.2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)'
                                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.3)'
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)'
                                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.2)'
                                    }}
                                >
                                    See More
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="9 18 15 12 9 6"></polyline>
                                    </svg>
                                </button>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default History
