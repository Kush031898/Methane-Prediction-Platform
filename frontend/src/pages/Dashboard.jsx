// Dashboard.jsx
import React, { useState, useContext, useEffect } from 'react'
import { AuthContext } from '../context/AuthContext'
import toast from 'react-hot-toast'
import AnalyticsView from '../components/AnalyticsView'

let dashboardCache = null;

const Dashboard = () => {
    const { api } = useContext(AuthContext)
    const [formData, setFormData] = useState(dashboardCache?.formData || {
        cod: '', flow: '', c_n_ratio: '', temp: '', ph: '', hrt: '', time: ''
    });
    const [prediction, setPrediction] = useState(dashboardCache?.prediction || null)
    const [loading, setLoading] = useState(false)
    const [historyData, setHistoryData] = useState([])
    const [influenceData, setInfluenceData] = useState(dashboardCache?.influenceData || [])
    const [showResult, setShowResult] = useState(dashboardCache?.showResult || false)

    useEffect(() => {
        dashboardCache = { formData, prediction, showResult, influenceData };
    }, [formData, prediction, showResult, influenceData]);

    const fetchHistory = async () => {
        try {
            const res = await api.get('/predict/history')
            const sortedData = res.data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
            setHistoryData(sortedData.slice(-10))
        } catch (err) {
            console.error("Could not fetch history")
        }
    }

    useEffect(() => {
        fetchHistory()
        // eslint-disable-next-line
    }, [])

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setShowResult(false)
        try {
            const res = await api.post('/predict/', {
                cod: parseFloat(formData.cod),
                flow: parseFloat(formData.flow),
                c_n_ratio: parseFloat(formData.c_n_ratio),
                temp: parseFloat(formData.temp),
                ph: parseFloat(formData.ph),
                hrt: parseFloat(formData.hrt),
                time: parseFloat(formData.time)
            })

            setPrediction(res.data.methane_yield)
            
            if (res.data.feature_importances) {
                const colors = ['#00ff9d', '#10b981', '#0ea5e9', '#3b82f6', '#6366f1']
                const formatted = Object.entries(res.data.feature_importances)
                    .map(([name, value], index) => ({
                        name: name.replace('_', ' ').toUpperCase(),
                        value: Math.round(value * 100),
                        color: colors[index % colors.length]
                    }))
                setInfluenceData(formatted.sort((a, b) => b.value - a.value).slice(0, 5))
            }

            setShowResult(true)
            fetchHistory()
            toast.success('Prediction generated successfully!')
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Prediction failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="dashboard-grid">
            <div className="glass-panel fade-in">
                <h3 className="gradient-text" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Enter Biogas Parameters
                </h3>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                        <label>COD (mg/L)</label>
                        <input className="form-control" name="cod" type="number" step="any" required
                            value={formData.cod} onChange={handleChange} placeholder="e.g. 25000" />
                    </div>
                    <div className="form-group">
                        <label>Flow (OLR)</label>
                        <input className="form-control" name="flow" type="number" step="any" required
                            value={formData.flow} onChange={handleChange} placeholder="e.g. 5.2" />
                    </div>
                    <div className="form-group">
                        <label>C/N Ratio</label>
                        <input className="form-control" name="c_n_ratio" type="number" step="any" required
                            value={formData.c_n_ratio} onChange={handleChange} placeholder="e.g. 25" />
                    </div>
                    <div className="form-group">
                        <label>Temperature (°C)</label>
                        <input className="form-control" name="temp" type="number" step="any" required
                            value={formData.temp} onChange={handleChange} placeholder="e.g. 35" />
                    </div>
                    <div className="form-group">
                        <label>pH Level</label>
                        <input className="form-control" name="ph" type="number" step="any" required
                            value={formData.ph} onChange={handleChange} placeholder="e.g. 7.2" />
                    </div>
                    <div className="form-group">
                        <label>HRT (Days)</label>
                        <input className="form-control" name="hrt" type="number" step="any" required
                            value={formData.hrt} onChange={handleChange} placeholder="e.g. 20" />
                    </div>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label>Time (Days)</label>
                        <input className="form-control" name="time" type="number" step="any" required
                            value={formData.time} onChange={handleChange} placeholder="e.g. 10" />
                    </div>
                    <button type="submit" className="btn" disabled={loading} style={{ gridColumn: 'span 2', marginTop: '0.5rem', height: '48px' }}>
                        {loading ? (
                            <>
                                <span className="spinner"></span> Analyzing...
                            </>
                        ) : (
                            <>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                                Predict Methane Yield
                            </>
                        )}
                    </button>
                </form>
            </div>

            <div className="glass-panel result-display" style={{ justifyContent: showResult ? 'flex-start' : 'center', padding: '2rem' }}>
                {showResult ? (
                    <AnalyticsView 
                        prediction={prediction} 
                        formData={formData} 
                        influenceData={influenceData} 
                        historyData={historyData} 
                    />
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: loading ? 0.5 : 1, transition: 'opacity 0.3s ease' }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--panel-border)" strokeWidth="1" style={{ marginBottom: '1rem' }}>
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="3" y1="9" x2="21" y2="9"></line>
                            <line x1="9" y1="21" x2="9" y2="9"></line>
                        </svg>
                        <h4 style={{ color: 'var(--text-muted)' }}>Awaiting Parameters</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem', maxWidth: '80%' }}>
                            Enter parameters on the left to invoke the ML model and predict methane yield.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Dashboard

