import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLink, FiBarChart } from 'react-icons/fi';
import ShortenForm from './components/ShortenForm';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'shorten' | 'dashboard'>('shorten');

    const tabVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
        exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
    };

    return (
        <div className="min-vh-100 flex-column" style={{ background: 'transparent' }}>
            {/* ── Enhanced Navigation ── */}
            <nav className="sticky-top" style={{
                background: 'rgba(18, 18, 18, 0.7)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid var(--border-subtle)',
                zIndex: 1000,
            }}>
                <div className="container flex justify-between items-center" style={{ height: '80px', padding: '0 1.5rem' }}>
                    {/* Logo */}
                    <motion.div
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => setActiveTab('shorten')}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className="flex-center" style={{
                            width: '48px',
                            height: '48px',
                            background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                            borderRadius: '14px',
                            boxShadow: '0 8px 32px var(--primary-glow)',
                            color: 'white',
                        }}>
                            <FiLink size={24} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '1.35rem', fontWeight: '900', letterSpacing: '-0.02em', margin: 0, color: 'var(--text-primary)' }}>
                                SnapLink
                            </h1>
                            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>Professional URL Shortener</p>
                        </div>
                    </motion.div>

                    {/* Navigation Tabs */}
                    <div className="flex items-center gap-2" style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.5rem', borderRadius: '1rem', border: '1px solid var(--border-subtle)' }}>
                        {[
                            { tab: 'shorten', label: 'Create Link', icon: FiLink },
                            { tab: 'dashboard', label: 'Analytics', icon: FiBarChart }
                        ].map(({ tab, label, icon: Icon }) => (
                            <motion.button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`btn-tab-new`}
                                style={{
                                    padding: '0.7rem 1.5rem',
                                    border: 'none',
                                    background: activeTab === tab ? 'var(--border-hover)' : 'transparent',
                                    color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-muted)',
                                    borderRadius: '0.875rem',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    fontWeight: activeTab === tab ? '600' : '500',
                                    transition: 'all 0.3s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                }}
                                whileHover={{ scale: 1.05 }}
                            >
                                <Icon size={18} />
                                {label}
                            </motion.button>
                        ))}
                    </div>

                    {/* Tech Stack Badges */}
                    <div className="flex gap-2 hide-mobile">
                        <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>Redis</span>
                        <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>PostgreSQL</span>
                    </div>
                </div>
            </nav>

            {/* ── Main Content ── */}
            <main className="flex-column" style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                <div className="container" style={{ padding: '2rem 1.5rem', flex: 1 }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            variants={tabVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            {activeTab === 'shorten' ? (
                                <div className="flex-column items-center" style={{ gap: '3rem', paddingTop: '2rem' }}>
                                    {/* Hero Section */}
                                    <motion.div
                                        className="text-center"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2, duration: 0.6 }}
                                    >
                                        <h2 style={{
                                            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                                            fontWeight: '900',
                                            lineHeight: 1.2,
                                            marginBottom: '1rem',
                                            letterSpacing: '-0.03em',
                                            color: 'var(--text-primary)',
                                        }} className="gradient-text-accent">
                                            Shorten. Share. Track.
                                        </h2>
                                        <p style={{
                                            color: 'var(--text-secondary)',
                                            fontSize: 'clamp(0.95rem, 2vw, 1.15rem)',
                                            maxWidth: '600px',
                                            margin: '0 auto',
                                            lineHeight: 1.6,
                                        }}>
                                            Create professional, trackable short URLs with real-time analytics, custom branding, and enterprise-grade security.
                                        </p>
                                    </motion.div>

                                    {/* Form */}
                                    <motion.div
                                        className="w-full"
                                        style={{ maxWidth: '700px' }}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.4, duration: 0.5 }}
                                    >
                                        <ShortenForm />
                                    </motion.div>

                                    {/* Feature Pills */}
                                    <motion.div
                                        className="flex gap-3 flex-wrap justify-center hide-mobile"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.6, duration: 0.5 }}
                                    >
                                        {['99.99% Uptime', 'Enterprise Security', 'Real-time Analytics'].map((feature) => (
                                            <div key={feature} className="badge badge-primary" style={{ padding: '0.5rem 1rem' }}>
                                                {feature}
                                            </div>
                                        ))}
                                    </motion.div>
                                </div>
                            ) : (
                                <Dashboard />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            {/* ── Modern Footer ── */}
            <footer style={{
                borderTop: '1px solid var(--border-subtle)',
                background: 'rgba(18, 18, 18, 0.4)',
                backdropFilter: 'blur(10px)',
                padding: '2rem 1.5rem',
                marginTop: 'auto',
            }} className="relative z-10">
                <div className="container">
                    <div className="flex justify-between items-center flex-wrap gap-4">
                        <motion.p
                            style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}
                            whileHover={{ color: 'var(--text-secondary)' }}
                        >
                            © 2026 SnapLink. Built with precision.
                        </motion.p>
                        <div className="flex gap-2 flex-wrap">
                            <span className="badge badge-primary">Ultra-fast</span>
                            <span className="badge badge-success">Reliable</span>
                            <span className="badge badge-secondary">Analytics</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default App;
