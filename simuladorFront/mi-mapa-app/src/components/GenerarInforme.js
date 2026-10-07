import React, { useState } from 'react';
import './GenerarInforme.css';
import {
    PieChart, Pie, Cell, Tooltip as RechartTooltip, Legend,
    BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid,
    RadialBarChart, RadialBar,
} from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const COLORS = {
    primary: '#2563eb',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    purple: '#8b5cf6',
    indigo: '#6366f1',
    teal: '#14b8a6',
    pink: '#ec4899',
};

const PIE_COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const BAR_COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6', '#ec4899'];

const ESTADO_CONFIG = {
    ESPERANDO: { label: 'Esperando', color: '#94a3b8', bg: '#f1f5f9' },
    EN_RUTA: { label: 'En Ruta', color: '#2563eb', bg: '#eff6ff' },
    RECOGIENDO: { label: 'Recogiendo', color: '#f59e0b', bg: '#fffbeb' },
    COMPLETADO: { label: 'Completado', color: '#10b981', bg: '#ecfdf5' },
};

const GenerarInforme = ({ data, autoRefresh, onToggleAutoRefresh }) => {
    const [vistaDetalle, setVistaDetalle] = useState(null);

    if (!data || !data.camiones) {
        return (
            <div className="informe-empty">
                <div className="empty-icon">📊</div>
                <h3>Sin datos disponibles</h3>
                <p>Configura camiones y ejecuta la simulación para ver las estadísticas.</p>
            </div>
        );
    }

    const { camiones } = data;
    const resumen = data;

    const handlePDF = async () => {
        const element = document.getElementById('informe-pdf');
        const canvas = await html2canvas(element, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('informe-ecofleet.pdf');
    };

    const lastUpdate = resumen.timestamp
        ? new Date(resumen.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        : '--:--:--';

    // Data for charts
    const residuosPieData = [
        { name: 'Vidrio', value: resumen.totalVidrioKg },
        { name: 'Papel', value: resumen.totalPapelKg },
        { name: 'Resto', value: resumen.totalRestoKg },
    ].filter(d => d.value > 0);

    const comparativaCamiones = camiones.map(c => ({
        name: `C${c.id}`,
        distancia: c.distanciaRecorrida,
        contenedores: c.contenedoresRecogidos,
        residuos: c.totalResiduosRecogidos || (c.vidrioRecogido + c.papelRecogido + c.restoRecogido),
    }));

    const eficienciaData = camiones.map(c => ({
        name: `Camión ${c.id}`,
        eficiencia: c.eficienciaKgPorKm || 0,
        fill: BAR_COLORS[c.id % BAR_COLORS.length],
    }));

    const cargaRadialData = camiones.map((c, i) => ({
        name: `C${c.id}`,
        value: c.porcentajeCargaUsado || 0,
        fill: BAR_COLORS[i % BAR_COLORS.length],
    }));

    const kpis = [
        { label: 'Camiones Activos', value: resumen.totalCamiones, icon: '🚛', color: COLORS.primary },
        { label: 'Contenedores Recogidos', value: resumen.totalContenedoresRecogidos, icon: '♻️', color: COLORS.success },
        { label: 'Distancia Total', value: `${resumen.totalDistanciaKm} km`, icon: '📏', color: COLORS.warning },
        { label: 'Residuos Totales', value: `${resumen.totalResiduosKg} kg`, icon: '🗑️', color: COLORS.purple },
        { label: 'Tiempo Promedio', value: `${resumen.tiempoPromedioMin} min`, icon: '⏱️', color: COLORS.teal },
        { label: 'Carga Promedio', value: `${resumen.porcentajeCargaPromedio}%`, icon: '📦', color: COLORS.pink },
    ];

    return (
        <div className="informe-wrapper" id="informe-pdf">
            {/* HEADER */}
            <div className="informe-header">
                <div>
                    <h1 className="informe-title">Dashboard de Estadísticas</h1>
                    <p className="informe-subtitle">Resumen operativo de la flota de recogida</p>
                </div>
                <div className="informe-header-actions">
                    <div className="live-indicator-container">
                        <button
                            className={`btn-auto-refresh ${autoRefresh ? 'active' : ''}`}
                            onClick={onToggleAutoRefresh}
                        >
                            <span className={`live-dot ${autoRefresh ? 'pulsing' : ''}`} />
                            {autoRefresh ? 'LIVE' : 'PAUSADO'}
                        </button>
                        <span className="last-update-label">Última act: {lastUpdate}</span>
                    </div>
                    <button className="btn-pdf" onClick={handlePDF}>
                        📥 Exportar PDF
                    </button>
                </div>
            </div>

            {/* FLEET STATUS BAR */}
            <div className="fleet-status-bar">
                <div className="fleet-status-item">
                    <span className="fleet-status-dot" style={{ background: ESTADO_CONFIG.EN_RUTA.color }} />
                    <span className="fleet-status-count">{resumen.camionesEnRuta || 0}</span>
                    <span className="fleet-status-label">En Ruta</span>
                </div>
                <div className="fleet-status-item">
                    <span className="fleet-status-dot" style={{ background: ESTADO_CONFIG.ESPERANDO.color }} />
                    <span className="fleet-status-count">{resumen.camionesEsperando || 0}</span>
                    <span className="fleet-status-label">Esperando</span>
                </div>
                <div className="fleet-status-item">
                    <span className="fleet-status-dot" style={{ background: ESTADO_CONFIG.COMPLETADO.color }} />
                    <span className="fleet-status-count">{resumen.camionesCompletados || 0}</span>
                    <span className="fleet-status-label">Completados</span>
                </div>
                <div className="fleet-status-item">
                    <span className="fleet-status-dot" style={{ background: COLORS.danger }} />
                    <span className="fleet-status-count">{resumen.camionesLlenos || 0}</span>
                    <span className="fleet-status-label">Llenos</span>
                </div>
                <div className="fleet-status-item fleet-progress-item">
                    <span className="fleet-status-label">Progreso Flota</span>
                    <div className="fleet-progress-bar-container">
                        <div className="fleet-progress-bar-track">
                            <div
                                className="fleet-progress-bar-fill"
                                style={{ width: `${resumen.progresoFlotaPromedio || 0}%` }}
                            />
                        </div>
                        <span className="fleet-progress-value">{resumen.progresoFlotaPromedio || 0}%</span>
                    </div>
                </div>
            </div>

            {/* KPIs */}
            <div className="kpi-grid">
                {kpis.map((kpi, i) => (
                    <div className="kpi-card" key={i}>
                        <div className="kpi-icon" style={{ background: `${kpi.color}15`, color: kpi.color }}>
                            {kpi.icon}
                        </div>
                        <div className="kpi-info">
                            <span className="kpi-value">{kpi.value}</span>
                            <span className="kpi-label">{kpi.label}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* CHARTS ROW 1 */}
            <div className="charts-row">
                {/* Distribución de residuos */}
                <div className="chart-card">
                    <h3 className="chart-title">Distribución de Residuos</h3>
                    {residuosPieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={residuosPieData}
                                    cx="50%" cy="50%"
                                    innerRadius={60} outerRadius={100}
                                    paddingAngle={4}
                                    dataKey="value"
                                    stroke="none"
                                    isAnimationActive={false}
                                >
                                    {residuosPieData.map((entry, i) => (
                                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartTooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    formatter={(value) => [`${value} kg`, '']}
                                />
                                <Legend iconType="circle" wrapperStyle={{ fontSize: '13px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="chart-empty">Sin datos de residuos</div>
                    )}
                </div>

                {/* Comparativa de camiones */}
                <div className="chart-card chart-card-wide">
                    <h3 className="chart-title">Comparativa por Camión</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={comparativaCamiones} barGap={4}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <RechartTooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Legend iconType="circle" wrapperStyle={{ fontSize: '13px' }} />
                            <Bar dataKey="distancia" name="Distancia (km)" fill={COLORS.primary} radius={[4, 4, 0, 0]} isAnimationActive={false} />
                            <Bar dataKey="contenedores" name="Contenedores" fill={COLORS.success} radius={[4, 4, 0, 0]} isAnimationActive={false} />
                            <Bar dataKey="residuos" name="Residuos (kg)" fill={COLORS.warning} radius={[4, 4, 0, 0]} isAnimationActive={false} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* CHARTS ROW 2 */}
            <div className="charts-row">
                {/* Eficiencia */}
                <div className="chart-card">
                    <h3 className="chart-title">Eficiencia (kg/km)</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={eficienciaData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis type="number" tick={{ fontSize: 12 }} />
                            <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={80} />
                            <RechartTooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                formatter={(value) => [`${value} kg/km`, 'Eficiencia']}
                            />
                            <Bar dataKey="eficiencia" radius={[0, 4, 4, 0]} isAnimationActive={false}>
                                {eficienciaData.map((entry, i) => (
                                    <Cell key={i} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Carga utilizada */}
                <div className="chart-card">
                    <h3 className="chart-title">Porcentaje de Carga Utilizado</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <RadialBarChart
                            cx="50%" cy="50%"
                            innerRadius="20%" outerRadius="90%"
                            data={cargaRadialData}
                            startAngle={180} endAngle={0}
                        >
                            <RadialBar
                                background
                                dataKey="value"
                                cornerRadius={6}
                                isAnimationActive={false}
                            />
                            <RechartTooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                formatter={(value) => [`${value}%`, 'Carga']}
                            />
                            <Legend
                                iconSize={10}
                                layout="horizontal"
                                verticalAlign="bottom"
                                wrapperStyle={{ fontSize: '12px' }}
                            />
                        </RadialBarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* TRUCK DETAIL CARDS */}
            <h2 className="section-title">Detalle por Camión</h2>
            <div className="truck-grid">
                {camiones.map((camion, index) => {
                    const totalResiduos = camion.totalResiduosRecogidos || (camion.vidrioRecogido + camion.papelRecogido + camion.restoRecogido);
                    const porcentaje = camion.porcentajeCargaUsado || 0;
                    const barColor = porcentaje > 80 ? COLORS.danger : porcentaje > 50 ? COLORS.warning : COLORS.success;
                    const estadoConf = ESTADO_CONFIG[camion.estado] || ESTADO_CONFIG.ESPERANDO;
                    const progreso = camion.progresoRuta || 0;

                    return (
                        <div
                            className={`truck-card ${vistaDetalle === camion.id ? 'expanded' : ''}`}
                            key={camion.id}
                            onClick={() => setVistaDetalle(vistaDetalle === camion.id ? null : camion.id)}
                        >
                            <div className="truck-card-header">
                                <div className="truck-id-badge" style={{ background: BAR_COLORS[index % BAR_COLORS.length] }}>
                                    🚚 {camion.id}
                                </div>
                                <span
                                    className="truck-status-badge"
                                    style={{ background: estadoConf.bg, color: estadoConf.color }}
                                >
                                    {estadoConf.label}
                                </span>
                            </div>

                            <div className="truck-card-body">
                                <div className="truck-stat-row">
                                    <span className="truck-stat-label">Ruta</span>
                                    <span className="truck-stat-value">{camion.nombreRuta || '—'}</span>
                                </div>
                                <div className="truck-stat-row">
                                    <span className="truck-stat-label">Distancia recorrida</span>
                                    <span className="truck-stat-value">{camion.distanciaRecorrida} km</span>
                                </div>
                                <div className="truck-stat-row">
                                    <span className="truck-stat-label">Distancia total ruta</span>
                                    <span className="truck-stat-value">{camion.distanciaTotalRuta || '—'} km</span>
                                </div>
                                <div className="truck-stat-row">
                                    <span className="truck-stat-label">Tiempo transcurrido</span>
                                    <span className="truck-stat-value">{camion.tiempoTotal} min</span>
                                </div>
                                <div className="truck-stat-row">
                                    <span className="truck-stat-label">Contenedores</span>
                                    <span className="truck-stat-value">{camion.contenedoresRecogidos}</span>
                                </div>
                                <div className="truck-stat-row">
                                    <span className="truck-stat-label">Residuos totales</span>
                                    <span className="truck-stat-value">{totalResiduos} kg</span>
                                </div>

                                {/* Route progress */}
                                <div className="truck-progress">
                                    <div className="truck-progress-header">
                                        <span>Progreso ruta</span>
                                        <span style={{ color: COLORS.primary, fontWeight: 700 }}>{progreso}%</span>
                                    </div>
                                    <div className="truck-progress-bar">
                                        <div
                                            className="truck-progress-fill"
                                            style={{ width: `${Math.min(progreso, 100)}%`, background: COLORS.primary }}
                                        />
                                    </div>
                                </div>

                                {/* Load progress */}
                                <div className="truck-progress">
                                    <div className="truck-progress-header">
                                        <span>Carga utilizada</span>
                                        <span style={{ color: barColor, fontWeight: 700 }}>{porcentaje}%</span>
                                    </div>
                                    <div className="truck-progress-bar">
                                        <div
                                            className="truck-progress-fill"
                                            style={{ width: `${Math.min(porcentaje, 100)}%`, background: barColor }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {vistaDetalle === camion.id && (
                                <div className="truck-detail">
                                    <div className="truck-detail-grid">
                                        <div className="detail-chip vidrio">
                                            <span className="detail-chip-label">Vidrio</span>
                                            <span className="detail-chip-value">{camion.vidrioRecogido} kg</span>
                                        </div>
                                        <div className="detail-chip papel">
                                            <span className="detail-chip-label">Papel</span>
                                            <span className="detail-chip-value">{camion.papelRecogido} kg</span>
                                        </div>
                                        <div className="detail-chip resto">
                                            <span className="detail-chip-label">Resto</span>
                                            <span className="detail-chip-value">{camion.restoRecogido} kg</span>
                                        </div>
                                        <div className="detail-chip velocidad">
                                            <span className="detail-chip-label">Velocidad</span>
                                            <span className="detail-chip-value">{camion.velocidad} km/h</span>
                                        </div>
                                        <div className="detail-chip eficiencia">
                                            <span className="detail-chip-label">Eficiencia</span>
                                            <span className="detail-chip-value">{camion.eficienciaKgPorKm || 0} kg/km</span>
                                        </div>
                                        <div className="detail-chip capacidad">
                                            <span className="detail-chip-label">Cap. Disponible</span>
                                            <span className="detail-chip-value">{camion.capacidadDisponible} / {camion.capacidadInicial}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default GenerarInforme;
