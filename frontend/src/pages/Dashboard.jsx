// Dashboard.jsx
import { useState, useContext, useEffect } from 'react'
import { AuthContext } from '../context/AuthContext'
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis 
} from 'recharts'

const Dashboard = () => {
    const { api } = useContext(AuthContext)
    const [formData, setFormData] = useState({
        cod: '', flow: '', c_n_ratio: '', temp: '', ph: '', hrt: '', time: ''
    });
    const [prediction, setPrediction] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [historyData, setHistoryData] = useState([])
    const [radarData, setRadarData] = useState([])

    const fetchHistory = async () => {
        try {
            const res = await api.get('/predict/history')
            const sortedData = res.data.sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp))
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
        setFormData({...formData, [e.target.name]: e.target.value})
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
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
            
            // Generate normalized radar data for visualization mapping a 0-100 scale conceptually
            setRadarData([
                { subject: 'Organic Load', value: Math.min((parseFloat(formData.cod) / 30000) * 100, 100) },
                { subject: 'pH Balance', value: Math.min((parseFloat(formData.ph) / 10) * 100, 100) },
                { subject: 'Thermal Profile', value: Math.min((parseFloat(formData.temp) / 55) * 100, 100) },
                { subject: 'Retention (HRT)', value: Math.min((parseFloat(formData.hrt) / 30) * 100, 100) },
                { subject: 'C/N Balance', value: Math.min((parseFloat(formData.c_n_ratio) / 50) * 100, 100) },
            ])
            
            fetchHistory() 
        } catch (err) {
            setError(err.response?.data?.detail || "Prediction Failed")
        }
        setLoading(false)
    }

    const renderAnalyticFeedback = () => {
        if (prediction === null) return null;
        if (prediction >= 350) {
            return <div style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '10px', borderRadius: '8px', fontWeight: 'bold' }}>Optimal Parameter Configuration Detected: High Biogas Synthesis Expected.</div>
        } else if (prediction >= 200) {
            return <div style={{ color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)', padding: '10px', borderRadius: '8px' }}>Stable Operation: Moderate Yield Generated. Consider adjusting Temperature or HRT for optimization.</div>
        } else {
            return <div style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '8px' }}>Sub-optimal Reaction Conditions: Extremely low yield projected. Please review pH and active Flow metrics.</div>
        }
    }

    return (
        <div className="dashboard-grid">
            <div className="glass-panel">
                <h3 className="gradient-text" style={{marginBottom: '1.5rem'}}>Enter Biogas Parameters</h3>
                {error && <div className="error-text">{error}</div>}
                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                    <div className="form-group">
                        <label>COD (mg/L)</label>
                        <input className="form-control" name="cod" type="number" step="any" required
                            value={formData.cod} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Flow (OLR)</label>
                        <input className="form-control" name="flow" type="number" step="any" required
                            value={formData.flow} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>C/N Ratio</label>
                        <input className="form-control" name="c_n_ratio" type="number" step="any" required
                            value={formData.c_n_ratio} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Temperature (°C)</label>
                        <input className="form-control" name="temp" type="number" step="any" required
                            value={formData.temp} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>pH Level</label>
                        <input className="form-control" name="ph" type="number" step="any" required
                            value={formData.ph} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>HRT (Days)</label>
                        <input className="form-control" name="hrt" type="number" step="any" required
                            value={formData.hrt} onChange={handleChange} />
                    </div>
                    <div className="form-group" style={{gridColumn: 'span 2'}}>
                        <label>Time (Days)</label>
                        <input className="form-control" name="time" type="number" step="any" required
                            value={formData.time} onChange={handleChange} />
                    </div>
                    <button type="submit" className="btn" style={{gridColumn: 'span 2', marginTop: '0.5rem'}}>
                        {loading ? 'Predicting...' : 'Predict Methane Yield'}
                    </button>
                </form>
            </div>

            <div className="glass-panel result-display" style={{justifyContent: prediction !== null ? 'flex-start' : 'center', padding: '1rem 2rem'}}>
                {prediction !== null ? (
                    <div style={{width: '100%'}}>
                        <h4 style={{color: 'var(--text-muted)', marginBottom: '0.5rem', textAlign: 'left'}}>Projected Methane Yield</h4>
                        <div className="yield-number gradient-text" style={{textAlign: 'left', margin: '0 0 1rem 0', fontSize: '3rem'}}>
                            {prediction.toFixed(2)}
                            <span style={{fontSize: '1.2rem', color: 'var(--text-muted)', marginLeft: '10px'}}>mL</span>
                        </div>
                        
                        {renderAnalyticFeedback()}

                        {radarData.length > 0 && (
                            <div style={{width: '100%', height: 260, marginTop: '2rem'}}>
                                <h5 style={{color: 'var(--text-muted)', marginBottom: '-1rem', textAlign: 'left'}}>Parameter Topology Setup</h5>
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                        <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                        <PolarAngleAxis dataKey="subject" tick={{fill: 'var(--text-muted)', fontSize: 11}} />
                                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                        <Radar name="Current Setup" dataKey="value" stroke="var(--primary-color)" fill="var(--primary-color)" fillOpacity={0.4} />
                                        <Tooltip contentStyle={{backgroundColor: 'var(--bg-color)', borderColor: 'var(--panel-border)'}} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                        
                        {historyData.length > 0 && (
                            <div style={{width: '100%', height: 240, marginTop: '1rem', boxSizing: 'border-box'}}>
                                <h5 style={{color: 'var(--text-muted)', marginBottom: '1rem', textAlign: 'left'}}>Recent Evaluation Trend</h5>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={historyData} margin={{top: 5, right: 10, left: -25, bottom: 5}}>
                                        <defs>
                                          <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.5}/>
                                            <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0}/>
                                          </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false}/>
                                        <XAxis 
                                          dataKey="timestamp" 
                                          tickFormatter={(time) => new Date(time).toLocaleDateString()} 
                                          stroke="var(--text-muted)" 
                                          fontSize={11}
                                          tickLine={false}
                                        />
                                        <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                                        <Tooltip 
                                          contentStyle={{backgroundColor: 'var(--bg-color)', borderColor: 'var(--panel-border)', borderRadius: '8px'}} 
                                          labelFormatter={(label) => new Date(label).toLocaleString()}
                                        />
                                        <Area 
                                          type="monotone" 
                                          dataKey="predicted_methane" 
                                          name="Methane Output"
                                          stroke="var(--primary-color)" 
                                          fillOpacity={1} 
                                          fill="url(#colorUv)" 
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
                        <h4 style={{color: 'var(--text-muted)'}}>Awaiting Data</h4>
                        <p style={{color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '1rem'}}>
                            Enter parameters on the left to invoke the ML model.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Dashboard
