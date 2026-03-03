import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import { FiTrendingUp, FiLink, FiTrash2, FiArrowRight, FiGlobe, FiMonitor, FiClock, FiBarChart } from 'react-icons/fi';
import { fetchUrls, fetchAnalytics, fetchGlobalAnalytics, deleteUrl, UrlItem, AnalyticsData, GlobalAnalytics } from '../api/client';
import ClicksLineChart from './charts/ClicksLineChart';
import DoughnutChart from './charts/DoughnutChart';
import GeoTable from './charts/GeoTable';

const Dashboard: React.FC = () => {
    const [urls, setUrls] = useState<UrlItem[]>([]);
    const [globalStats, setGlobalStats] = useState<GlobalAnalytics | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const selectedIdRef = React.useRef<string | null>(null);

    const loadData = async () => {
        try {
            const [urlData, globalData] = await Promise.all([
                fetchUrls(),
                fetchGlobalAnalytics(),
            ]);
            setUrls(urlData.urls);
            setGlobalStats(globalData);
        } catch (err) {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        const intervalId = setInterval(async () => {
            await loadData();
            if (selectedIdRef.current) {
                try {
                    const data = await fetchAnalytics(selectedIdRef.current);
                    setAnalytics(data);
                } catch (err) {
                    console.error('Failed to poll fetch analytics', err);
                }
            }
        }, 5000);
        return () => clearInterval(intervalId);
    }, []);

    const handleSelect = async (id: string) => {
        if (selectedId === id) {
            setSelectedId(null);
            selectedIdRef.current = null;
            setAnalytics(null);
            return;
        }
        setSelectedId(id);
        selectedIdRef.current = id;
        setLoadingDetails(true);
        try {
            const data = await fetchAnalytics(id);
            setAnalytics(data);
        } catch (err) {
            toast.error('Failed to load link analytics');
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!window.confirm('Permanently delete this link and all its analytics?')) return;

        try {
            await deleteUrl(id);
            toast.success('Link deleted successfully');
            loadData();
            if (selectedId === id) setSelectedId(null);
        } catch (err) {
            toast.error('Failed to delete link');
        }
    };

    if (loading) {
        return (
            <div className="flex-center" style={{ height: '400px', gap: '1rem', flexDirection: 'column' }}>
                <div className="spinner" />
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading analytics...</p>
            </div>
        );
    }

    const currentStats = analytics || globalStats;

    return (
        <motion.div
            className="animate-fade-in"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* ── Stats Overview ── */}
            <div className="grid-cols-2 mb-8">
                <motion.div
                    className="glass-card flex justify-between items-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    whileHover={{ transform: 'translateY(-4px)' }}
                >
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <FiTrendingUp size={18} color="var(--primary)" />
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                                Total Clicks
                            </p>
                        </div>
                        <h3 style={{
                            fontSize: '2.75rem',
                            fontWeight: '900',
                            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            margin: '0.5rem 0 0 0',
                        }}>
                            {(globalStats?.totalClicks || 0).toLocaleString()}
                        </h3>
                    </div>
                    <div className="badge badge-success" style={{ padding: '0.75rem 1.25rem' }}>
                        Live
                    </div>
                </motion.div>

                <motion.div
                    className="glass-card flex justify-between items-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    whileHover={{ transform: 'translateY(-4px)' }}
                >
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <FiLink size={18} color="var(--primary)" />
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                                Active Links
                            </p>
                        </div>
                        <h3 style={{
                            fontSize: '2.75rem',
                            fontWeight: '900',
                            background: 'linear-gradient(135deg, var(--primary), #4169E1)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            margin: '0.5rem 0 0 0',
                        }}>
                            {globalStats?.totalUrls || 0}
                        </h3>
                    </div>
                    <div className="badge badge-primary" style={{ padding: '0.75rem 1.25rem' }}>
                        Ready
                    </div>
                </motion.div>
            </div>

            {/* Main Content Grid */}
            <div className="grid-cols-2" style={{ gridTemplateColumns: 'minmax(0, 1fr) 420px', gap: '2rem' }}>
                {/* ── Link List ── */}
                <motion.div
                    className="glass-card p-0 overflow-hidden"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="p-6 border-bottom" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-surface)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <FiLink size={20} color="var(--primary)" />
                            <h3 style={{ fontWeight: '700', fontSize: '1.1rem', margin: 0, color: 'var(--text)' }}>
                                Your Recent Links ({urls.length})
                            </h3>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.5rem 0 0 0' }}>
                            Click to view detailed analytics
                        </p>
                    </div>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Destination</th>
                                    <th><FiArrowRight size={16} style={{ marginRight: '0.25rem' }} /> Clicks</th>
                                    <th style={{ textAlign: 'center' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {urls.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                                            No links yet. Create your first one!
                                        </td>
                                    </tr>
                                ) : (
                                    urls.map((url, idx) => (
                                        <motion.tr
                                            key={url.short_id}
                                            onClick={() => handleSelect(url.short_id)}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.2 + idx * 0.05 }}
                                            style={{
                                                cursor: 'pointer',
                                                background: selectedId === url.short_id ? 'var(--border-hover)' : 'transparent',
                                                borderLeft: selectedId === url.short_id ? '3px solid var(--primary)' : '3px solid transparent',
                                            }}
                                        >
                                            <td style={{ fontWeight: '700', color: 'var(--primary)', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                                                {url.short_id}
                                            </td>
                                            <td style={{
                                                color: 'var(--text-secondary)',
                                                maxWidth: '200px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                fontSize: '0.85rem',
                                            }}>
                                                {url.long_url}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span className="badge badge-primary" style={{
                                                    fontSize: '0.8rem',
                                                    fontWeight: '700',
                                                }}>
                                                    {(url.click_count || 0).toLocaleString()}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <motion.button
                                                    onClick={(e) => handleDelete(e, url.short_id)}
                                                    className="btn-danger"
                                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'center' }}
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    title="Delete link"
                                                >
                                                    <FiTrash2 size={14} />
                                                </motion.button>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* ── Detailed Analytics Panel ── */}
                <motion.div
                    className="flex-column gap-4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    {/* View Context Switcher */}
                    <motion.div
                        className="glass-card flex justify-between items-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        whileHover={{ borderColor: 'var(--border-hover)' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {selectedId ? <FiBarChart size={18} color="var(--primary)" /> : <FiGlobe size={18} color="var(--primary)" />}
                            <div>
                                <p style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {selectedId ? 'Link Analytics' : 'Global Overview'}
                                </p>
                                {selectedId && (
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.35rem 0 0 0' }}>
                                        ID: <code style={{ color: 'var(--primary)', fontFamily: 'monospace', fontWeight: '600' }}>{selectedId}</code>
                                    </p>
                                )}
                            </div>
                        </div>
                        {selectedId && (
                            <motion.button
                                onClick={() => setSelectedId(null)}
                                className="btn-ghost"
                                style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                                whileHover={{ scale: 1.05 }}
                            >
                                Back
                            </motion.button>
                        )}
                    </motion.div>

                    {loadingDetails ? (
                        <div className="glass-card flex-column flex-center" style={{ height: '300px', gap: '1rem' }}>
                            <div className="spinner" />
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading analytics...</p>
                        </div>
                    ) : (
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={selectedId || 'global'}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex-column gap-4"
                            >
                                {/* Activity Chart */}
                                <motion.div className="glass-card" whileHover={{ borderColor: 'var(--border-hover)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                        <FiArrowRight size={16} color="var(--primary)" />
                                        <p style={{ fontSize: '0.85rem', fontWeight: '600', margin: 0, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            Click Activity
                                        </p>
                                    </div>
                                    <ClicksLineChart data={currentStats?.timeSeries || []} />
                                </motion.div>

                                {/* QR Code (only for specific links) */}
                                {selectedId && analytics && (
                                    <motion.div
                                        className="glass-card flex-column gap-3"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.1 }}
                                    >
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <FiBarChart size={16} color="var(--primary)" />
                                                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', margin: 0, color: 'var(--text)' }}>
                                                    QR Code
                                                </h4>
                                            </div>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.35rem 0 0 0' }}>
                                                Scan to visit or download
                                            </p>
                                        </div>
                                        <div style={{ padding: '12px', background: 'var(--text-primary)', borderRadius: '12px', display: 'flex', justifyContent: 'center' }}>
                                            <QRCodeSVG value={`${window.location.origin}/${selectedId}`} size={100} level="H" bgColor="var(--text-primary)" fgColor="var(--bg-base)" />
                                        </div>
                                    </motion.div>
                                )}

                                {/* Distribution Charts */}
                                <motion.div
                                    className="glass-card"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.15 }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                        <FiMonitor size={16} color="var(--primary)" />
                                        <p style={{ fontSize: '0.85rem', fontWeight: '600', margin: 0, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            Distribution Analysis
                                        </p>
                                    </div>
                                    <div className="flex gap-3">
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: '500' }}>Operating Systems</p>
                                            <DoughnutChart data={currentStats?.osList || []} label="OS" />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: '500' }}>Device Types</p>
                                            <DoughnutChart data={(currentStats as any)?.deviceTypes || []} label="Devices" />
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Top Countries */}
                                <motion.div
                                    className="glass-card p-0"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <div className="p-4 border-bottom" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-surface)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <FiGlobe size={16} color="var(--primary)" />
                                            <p style={{ fontSize: '0.85rem', fontWeight: '700', margin: 0, color: 'var(--text)' }}>Top Countries</p>
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        <GeoTable data={currentStats?.countries || []} />
                                    </div>
                                </motion.div>

                                {/* Recent Activity Feed */}
                                <motion.div
                                    className="glass-card p-0"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.25 }}
                                >
                                    <div className="p-4 border-bottom" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-surface)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <FiClock size={16} color="var(--primary)" />
                                            <p style={{ fontSize: '0.85rem', fontWeight: '700', margin: 0, color: 'var(--text)' }}>Recent Hits</p>
                                        </div>
                                    </div>
                                    <div className="p-2" style={{ maxHeight: '250px', overflow: 'y-auto' }}>
                                        {(currentStats as any)?.recentClicks?.length > 0 ? (
                                            (currentStats as any).recentClicks.slice(0, 8).map((click: any, idx: number) => (
                                                <motion.div
                                                    key={idx}
                                                    className="flex justify-between items-center p-3"
                                                    style={{
                                                        borderBottom: idx < 7 ? '1px solid var(--border-subtle)' : 'none',
                                                    }}
                                                    initial={{ opacity: 0, x: -5 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.02 * idx }}
                                                >
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                                        {click.ip_address}
                                                    </span>
                                                    <div className="flex gap-1" style={{ flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                                        <span className="badge badge-secondary" style={{ fontSize: '0.65rem' }}>{click.browser}</span>
                                                        <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>{click.os}</span>
                                                    </div>
                                                </motion.div>
                                            ))
                                        ) : (
                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem 0.5rem', margin: 0 }}>
                                                No activity recorded yet
                                            </p>
                                        )}
                                    </div>
                                </motion.div>
                            </motion.div>
                        </AnimatePresence>
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
};

export default Dashboard;
