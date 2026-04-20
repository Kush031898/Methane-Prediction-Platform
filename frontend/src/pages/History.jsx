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

    if (loading) return <div className="glass-panel" style={{textAlign: 'center'}}>Loading...</div>

    return (
        <div className="glass-panel" style={{overflowX: 'auto'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem'}}>
                <h3 className="gradient-text">Prediction History</h3>
                <span style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>
                    Displaying {logs.length} previous records
                </span>
            </div>
            
            {logs.length === 0 ? (
                <p style={{color: 'var(--text-muted)', textAlign: 'center'}}>No prediction logs found.</p>
            ) : (
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
                        {logs.map(log => (
                            <tr key={log.id}>
                                {user.role === 'admin' && <td>#{log.user_id}</td>}
                                <td>{new Date(log.timestamp).toLocaleDateString()}</td>
                                <td>{log.cod.toFixed(1)}</td>
                                <td>{log.ph}</td>
                                <td>{log.temperature}°C</td>
                                <td>{log.hrt}d</td>
                                <td style={{fontWeight: 'bold', color: 'var(--primary-color)'}}>
                                    {log.predicted_methane.toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    )
}

export default History
