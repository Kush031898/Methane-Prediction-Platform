// Dashboard.jsx
import React, { useState, useContext, useEffect, Fragment } from 'react'
import { AuthContext } from '../context/AuthContext'
import toast from 'react-hot-toast'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    BarChart, Bar, Cell, Legend, PieChart, Pie, LabelList
} from 'recharts'
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

let dashboardCache = null;

const AnimatedNumber = ({ value }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        let startTimestamp = null;
        const duration = 2500;
        const startValue = 0;

        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const easeProgress = progress * (2 - progress);
            setDisplayValue(startValue + easeProgress * (value - startValue));
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                setDisplayValue(value);
            }
        };

        window.requestAnimationFrame(step);
    }, [value]);

    // Add commas for thousands separator
    return displayValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const Dashboard = () => {
    const { api } = useContext(AuthContext)
    const [formData, setFormData] = useState(dashboardCache?.formData || {
        cod: '', flow: '', c_n_ratio: '', temp: '', ph: '', hrt: '', time: ''
    });
    const [prediction, setPrediction] = useState(dashboardCache?.prediction || null)
    const [loading, setLoading] = useState(false)
    const [historyData, setHistoryData] = useState([])
    const [radarData, setRadarData] = useState(dashboardCache?.radarData || [])
    const [barData, setBarData] = useState(dashboardCache?.barData || [])
    const [influenceData, setInfluenceData] = useState(dashboardCache?.influenceData || [])
    const [showResult, setShowResult] = useState(dashboardCache?.showResult || false)

    useEffect(() => {
        dashboardCache = { formData, prediction, showResult, radarData, barData, influenceData };
    }, [formData, prediction, showResult, radarData, barData, influenceData]);

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

            // Normalized data for Radar
            setRadarData([
                { subject: 'Organic Load', value: Math.min((parseFloat(formData.cod) / 30000) * 100, 100) },
                { subject: 'pH Balance', value: Math.min((parseFloat(formData.ph) / 10) * 100, 100) },
                { subject: 'Thermal Profile', value: Math.min((parseFloat(formData.temp) / 55) * 100, 100) },
                { subject: 'Retention (HRT)', value: Math.min((parseFloat(formData.hrt) / 30) * 100, 100) },
                { subject: 'C/N Balance', value: Math.min((parseFloat(formData.c_n_ratio) / 50) * 100, 100) },
            ])

            // Bar chart data comparing against industry optimal baselines
            setBarData([
                { name: 'pH', actual: parseFloat(formData.ph), optimal: 7.2, unit: 'pH' },
                { name: 'Temp', actual: parseFloat(formData.temp), optimal: 35, unit: '°C' },
                { name: 'C/N', actual: parseFloat(formData.c_n_ratio), optimal: 25, unit: 'Ratio' },
                { name: 'HRT', actual: parseFloat(formData.hrt), optimal: 20, unit: 'Days' }
            ])

            // Influence Donut Chart data
            if (res.data.feature_importances) {
                const colors = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b']
                const pieData = Object.entries(res.data.feature_importances).map(([key, value], idx) => ({
                    name: key.replace('_', ' '),
                    value: value,
                    color: colors[idx % colors.length]
                }))
                // Sort to show highest influence first, take top 5
                pieData.sort((a, b) => b.value - a.value)
                setInfluenceData(pieData.slice(0, 5))
            }

            setTimeout(() => {
                setPrediction(res.data.methane_yield)
                setShowResult(true)
                setLoading(false)
                fetchHistory()

                if (res.data.methane_yield < 200) {
                    toast.error("Warning: Sub-optimal yield predicted. Review parameters.", { duration: 4000 })
                } else {
                    toast.success("Prediction successful!")
                }
            }, 600)

        } catch (err) {
            toast.error(err.response?.data?.detail || "Prediction Failed")
            setLoading(false)
        }
    }

    const generateReport = async () => {
        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(20);
        doc.setTextColor(14, 165, 233);
        doc.text('Methane Prediction Analytics Report', 14, 22);
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
        
        // Input Parameters Table
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text('Input Parameters:', 14, 45);
        
        autoTable(doc, {
            startY: 50,
            head: [['Parameter', 'Value', 'Unit']],
            body: [
                ['Chemical Oxygen Demand (COD)', formData.cod, 'mg/L'],
                ['Organic Loading Rate (Flow)', formData.flow, ''],
                ['C/N Ratio', formData.c_n_ratio, ''],
                ['Temperature', formData.temp, '°C'],
                ['pH Level', formData.ph, ''],
                ['Hydraulic Retention Time (HRT)', formData.hrt, 'Days'],
                ['Time', formData.time, 'Days']
            ],
            theme: 'striped',
            headStyles: { fillColor: [14, 165, 233] },
        });

        const finalY = doc.lastAutoTable.finalY || 50;

        // Prediction Result
        doc.setFontSize(16);
        doc.text('Prediction Result:', 14, finalY + 15);
        
        doc.setFontSize(24);
        doc.setTextColor(16, 185, 129);
        doc.text(`${prediction.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} mL`, 14, finalY + 25);
        
        // Analytic Feedback
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text('Analytic Assessment:', 14, finalY + 40);
        
        doc.setFontSize(11);
        doc.setTextColor(80);
        
        let feedbackTitle = '';
        let feedbackDesc = '';
        
        if (prediction >= 350) {
            feedbackTitle = 'Optimal Parameter Configuration Detected';
            feedbackDesc = 'High Biogas Synthesis Expected. The system is operating at peak efficiency. No immediate tuning required.';
        } else if (prediction >= 200) {
            feedbackTitle = 'Stable Operation Baseline';
            feedbackDesc = 'Moderate Yield Generated. Consider micro-adjusting Temperature or HRT to push the system into the optimal synthesis range.';
        } else {
            feedbackTitle = 'CRITICAL: Sub-optimal Reaction Conditions';
            feedbackDesc = 'Extremely low yield projected. System may be experiencing acidification or washout. Review pH and organic loading rate (OLR) immediately.';
        }
        
        doc.text(feedbackTitle, 14, finalY + 50);
        const splitDesc = doc.splitTextToSize(feedbackDesc, 180);
        doc.text(splitDesc, 14, finalY + 58);
        
        // Capture Charts
        const chartsElement = document.getElementById('charts-container');
        if (chartsElement) {
            try {
                // Fix for Recharts SVGs collapsing in html2canvas
                const svgs = chartsElement.querySelectorAll('svg');
                svgs.forEach(svg => {
                    const rect = svg.getBoundingClientRect();
                    svg.setAttribute('width', rect.width);
                    svg.setAttribute('height', rect.height);
                    svg.style.width = `${rect.width}px`;
                    svg.style.height = `${rect.height}px`;
                });

                // Use html2canvas to capture the visual charts
                const canvas = await html2canvas(chartsElement, { 
                    backgroundColor: '#121212', // Match dark theme bg
                    scale: 2 // High quality
                });
                
                // Revert SVG styles so UI doesn't break on resize
                svgs.forEach(svg => {
                    svg.style.width = '';
                    svg.style.height = '';
                });

                const imgData = canvas.toDataURL('image/png');
                
                // Add a new page for charts so it fits nicely
                doc.addPage();
                doc.setFontSize(16);
                doc.setTextColor(14, 165, 233);
                doc.text('Visual Analytics:', 14, 20);
                
                // Scale image to fit A4 page width (210mm)
                const imgWidth = 182; 
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                
                doc.addImage(imgData, 'PNG', 14, 30, imgWidth, imgHeight);
            } catch (err) {
                console.error('Error capturing charts for PDF:', err);
            }
        }

        // Footer
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text('Generated by MethaneML Platform', 14, 280);

        doc.save(`Methane_Report_${Date.now()}.pdf`);
    };

    const renderAnalyticFeedback = () => {
        if (prediction === null) return null;
        if (prediction >= 350) {
            return (
                <div className="feedback-card feedback-optimal">
                    <div style={{ fontSize: '1.5rem', marginTop: '0.2rem' }}>✨</div>
                    <div>
                        <strong style={{ fontSize: '1.05rem', color: '#fff' }}>Optimal Parameter Configuration Detected</strong>
                        <p style={{ margin: '0.4rem 0 0 0', opacity: 0.9, lineHeight: '1.5' }}>High Biogas Synthesis Expected. The system is operating at peak efficiency. No immediate tuning required.</p>
                    </div>
                </div>
            )
        } else if (prediction >= 200) {
            return (
                <div className="feedback-card feedback-stable">
                    <div style={{ fontSize: '1.5rem', marginTop: '0.2rem' }}>📊</div>
                    <div>
                        <strong style={{ fontSize: '1.05rem', color: '#fff' }}>Stable Operation Baseline</strong>
                        <p style={{ margin: '0.4rem 0 0 0', opacity: 0.9, lineHeight: '1.5' }}>Moderate Yield Generated. Consider micro-adjusting Temperature or HRT to push the system into the optimal synthesis range.</p>
                    </div>
                </div>
            )
        } else {
            return (
                <div className="feedback-card feedback-suboptimal">
                    <div style={{ fontSize: '1.5rem', marginTop: '0.2rem' }}>⚠️</div>
                    <div>
                        <strong style={{ fontSize: '1.05rem', color: '#fff' }}>CRITICAL: Sub-optimal Reaction Conditions</strong>
                        <p style={{ margin: '0.4rem 0 0 0', opacity: 0.9, lineHeight: '1.5' }}>Extremely low yield projected. System may be experiencing acidification or washout. Review pH and organic loading rate (OLR) immediately.</p>
                    </div>
                </div>
            )
        }
    }

    return (
        <div className="dashboard-grid">
            <div className="glass-panel fade-in">
                <h3 className="gradient-text" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {/* <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> */}
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
                    <div style={{ width: '100%' }} className="fade-in">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h4 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>Projected Methane Yield</h4>
                                <div className="yield-number gradient-text glow-text" style={{ textAlign: 'left', margin: '0 0 1.5rem 0', fontSize: '3.5rem' }}>
                                    <AnimatedNumber value={prediction} />
                                    <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginLeft: '10px', fontWeight: '500' }}>mL</span>
                                </div>
                            </div>
                        </div>

                        {renderAnalyticFeedback()}

                        <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '1.5rem' }}>
                            <button onClick={generateReport} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--primary-color)' }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                Download PDF Report
                            </button>
                        </div>

                        <div id="charts-container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '2rem' }}>

                            {/* Parameter Influence Horizontal Bar Chart */}
                            {influenceData.length > 0 && (
                                <div className="fade-in delay-1" style={{ height: 240, gridColumn: 'span 2', marginBottom: '1rem' }}>
                                    <h5 style={{ color: 'var(--text-muted)', marginBottom: '0', textAlign: 'center', fontWeight: '500', fontSize: '0.8rem' }}>AI Parameter Influence (Top 5 Drivers)</h5>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart layout="vertical" data={influenceData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="name" type="category" width={100} stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                                            <RechartsTooltip
                                                cursor={{ fill: 'rgba(253, 250, 250, 0.02)' }}
                                                contentStyle={{ backgroundColor: 'var(--bg-color)', borderColor: 'var(--panel-border)', borderRadius: '8px', color: '#10B981' }}
                                                formatter={(value) => [`${value}%`, 'Influence']}
                                            />
                                            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20} isAnimationActive={false}>
                                                {influenceData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                                <LabelList dataKey="value" position="right" formatter={(val) => `${val}%`} fill="var(--text-muted)" fontSize={11} fontWeight="bold" />
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}

                            {/* Radar Chart */}
                            {radarData.length > 0 && (
                                <div className="fade-in delay-2" style={{ height: 240 }}>
                                    <h5 style={{ color: 'var(--text-muted)', marginBottom: '0', textAlign: 'center', fontWeight: '500', fontSize: '0.8rem' }}>Parameter Topology</h5>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                                            <PolarGrid stroke="rgba(255,255,255,0.05)" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                            <Radar name="Current Setup" dataKey="value" stroke="#00ff9d" strokeWidth={2} fill="#00ff9d" fillOpacity={0.3} isAnimationActive={false} />
                                            <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-color)', borderColor: 'var(--panel-border)', borderRadius: '8px', color: '#fff' }} itemStyle={{ color: '#00ff9d' }} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}

                            {/* Bar Chart for Baseline Comparison */}
                            {barData.length > 0 && (
                                <div className="fade-in delay-3" style={{ height: 240 }}>
                                    <h5 style={{ color: 'var(--text-muted)', marginBottom: '0', textAlign: 'center', fontWeight: '500', fontSize: '0.8rem' }}>Baseline Deviation</h5>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={barData} margin={{ top: 20, right: 10, left: -25, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                            <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                                            <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                                            <RechartsTooltip
                                                cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                                contentStyle={{ backgroundColor: 'var(--bg-color)', borderColor: 'var(--panel-border)', borderRadius: '8px', color: '#fff' }}
                                            />
                                            <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                                            <Bar dataKey="actual" name="Actual" fill="#0ea5e9" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                                            <Bar dataKey="optimal" name="Optimal" fill="#00ff9d" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}

                            {/* Correlation Matrix Heatmap */}
                            {prediction !== null && (
                                <div className="fade-in delay-5" style={{ height: 240, gridColumn: 'span 2', marginTop: '1rem' }}>
                                    <h5 style={{ color: 'var(--text-muted)', marginBottom: '1rem', textAlign: 'center', fontWeight: '500', fontSize: '0.8rem' }}>Parameter Correlation Matrix</h5>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'auto repeat(5, 1fr)', gap: '4px', height: '80%', padding: '0 2rem' }}>
                                        {/* Header row */}
                                        <div></div>
                                        {['Temp', 'C/N', 'HRT', 'COD', 'Yield'].map(l => <div key={l} style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-muted)', alignSelf: 'end', paddingBottom: '4px' }}>{l}</div>)}

                                        {/* Matrix rows */}
                                        {[
                                            [1.00, -0.00, 0.00, -0.01, 0.53], // Temp
                                            [-0.00, 1.00, -0.00, -0.01, 0.19], // C/N
                                            [0.00, -0.00, 1.00, 0.00, 0.14], // HRT
                                            [-0.01, -0.01, 0.00, 1.00, 0.10], // COD
                                            [0.53, 0.19, 0.14, 0.10, 1.00]  // Yield
                                        ].map((row, i) => (
                                            <React.Fragment key={i}>
                                                <div style={{ textAlign: 'right', paddingRight: '8px', fontSize: '0.7rem', color: 'var(--text-muted)', alignSelf: 'center' }}>{['Temp', 'C/N', 'HRT', 'COD', 'Yield'][i]}</div>
                                                {row.map((val, j) => (
                                                    <div key={`${i}-${j}`} style={{
                                                        backgroundColor: val === 1 ? 'rgba(0, 255, 157, 0.8)' : val > 0.3 ? 'rgba(0, 255, 157, 0.5)' : val > 0.1 ? 'rgba(0, 255, 157, 0.2)' : val < -0.3 ? 'rgba(255, 42, 85, 0.5)' : val < -0.1 ? 'rgba(255, 42, 85, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '0.7rem',
                                                        color: val === 1 ? '#fff' : 'var(--text-muted)',
                                                        borderRadius: '4px',
                                                        transition: 'transform 0.2s',
                                                        cursor: 'pointer'
                                                    }} title={`Correlation: ${val}`}>
                                                        {val.toFixed(2)}
                                                    </div>
                                                ))}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Area Chart for History */}
                        {historyData.length > 0 && (
                            <div className="fade-in delay-4" style={{ width: '100%', height: 220, marginTop: '2rem', boxSizing: 'border-box' }}>
                                <h5 style={{ color: 'var(--text-muted)', marginBottom: '1rem', textAlign: 'left', fontWeight: '500' }}>Historical Yield Trend</h5>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={historyData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                        <XAxis
                                            dataKey="timestamp"
                                            tickFormatter={(time) => new Date(time).toLocaleDateString()}
                                            stroke="var(--text-muted)"
                                            fontSize={10}
                                            tickLine={false}
                                        />
                                        <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                                        <RechartsTooltip
                                            contentStyle={{ backgroundColor: 'var(--bg-color)', borderColor: 'var(--panel-border)', borderRadius: '8px', color: '#fff' }}
                                            labelFormatter={(label) => new Date(label).toLocaleString()}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="predicted_methane"
                                            name="Methane Output"
                                            stroke="#00ff9d"
                                            strokeWidth={2}
                                            fillOpacity={0.3}
                                            fill="#00ff9d"
                                            isAnimationActive={false}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
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

