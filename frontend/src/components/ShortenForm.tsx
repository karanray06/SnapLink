import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { FiCopy, FiShare2, FiCheck, FiChevronDown, FiChevronUp, FiLink } from 'react-icons/fi';
import { shortenUrl } from '../api/client';

const ShortenForm: React.FC = () => {
    const [longUrl, setLongUrl] = useState('');
    const [customAlias, setCustomAlias] = useState('');
    const [expiresAt, setExpiresAt] = useState('');
    const [loading, setLoading] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [result, setResult] = useState<{ shortUrl: string; shortId: string } | null>(null);
    const [urlValid, setUrlValid] = useState(false);

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setLongUrl(value);
        setUrlValid(value.startsWith('http://') || value.startsWith('https://'));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        try {
            const data = await shortenUrl({
                longUrl,
                customAlias: customAlias || undefined,
                expiresAt: expiresAt || undefined,
            });
            setResult(data);
            setLongUrl('');
            setCustomAlias('');
            setExpiresAt('');
            toast.success('Link created successfully!', {
                style: {
                    background: 'linear-gradient(135deg, rgba(46, 139, 87, 0.2), rgba(65, 105, 225, 0.2))',
                    color: '#2E8B57',
                    border: '1px solid rgba(46, 139, 87, 0.5)',
                    borderRadius: '1rem',
                },
                duration: 4000,
            });
        } catch (err: any) {
            const msg = err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Failed to shorten URL';
            toast.error(msg, {
                style: {
                    background: 'linear-gradient(135deg, rgba(220, 20, 60, 0.2), rgba(220, 20, 60, 0.15))',
                    color: '#DC143C',
                    border: '1px solid rgba(220, 20, 60, 0.5)',
                    borderRadius: '1rem',
                },
            });
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (!result) return;
        navigator.clipboard.writeText(result.shortUrl);
        toast.success('Copied to clipboard!', {
            style: {
                background: 'rgba(46, 139, 87, 0.15)',
                color: '#2E8B57',
                border: '1px solid rgba(46, 139, 87, 0.4)',
                borderRadius: '1rem',
            },
        });
    };

    const shareUrl = () => {
        if (!result) return;
        if (typeof navigator.share === 'function') {
            navigator.share({
                title: 'Check out my short link!',
                text: 'I shortened my URL using SnapLink',
                url: result.shortUrl,
            });
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-card"
            style={{ boxShadow: '0 8px 32px rgba(65, 105, 225, 0.1)' }}
        >
            <form onSubmit={handleSubmit}>
                {/* Main URL Input */}
                <div style={{ marginBottom: '2rem' }}>
                    <div className="flex items-center justify-between" style={{ marginBottom: '0.75rem' }}>
                        <label style={{
                            fontSize: '0.9rem',
                            fontWeight: '700',
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                        }}>
                            <FiLink size={18} />
                            Enter Your Long URL
                        </label>
                        {longUrl && (
                            <span style={{
                                fontSize: '0.75rem',
                                color: urlValid ? 'var(--success)' : 'var(--danger)',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                            }}>
                                {urlValid ? <><FiCheck size={14} /> Valid</> : <>Invalid format</>}
                            </span>
                        )}
                    </div>
                    <motion.input
                        type="url"
                        placeholder="https://example.com/very/long/document/path"
                        className="glass-input"
                        value={longUrl}
                        onChange={handleUrlChange}
                        required
                        whileFocus={{ scale: 1.02 }}
                        style={{
                            borderColor: urlValid && longUrl ? 'var(--success)' : longUrl && !urlValid ? 'var(--danger)' : 'var(--glass-border)',
                            boxShadow: urlValid && longUrl ? `0 0 0 3px rgba(46, 139, 87, 0.1)` : 'none',
                        }}
                    />
                    <p style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        marginTop: '0.5rem',
                    }}>
                        {longUrl.length > 0 ? `${longUrl.length} characters` : 'Paste your long URL to get started'}
                    </p>
                </div>

                {/* Advanced Options Toggle */}
                <motion.button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="btn-ghost"
                    style={{
                        fontSize: '0.85rem',
                        padding: '0.65rem 1rem',
                        marginBottom: '1.5rem',
                        width: '100%',
                        fontWeight: '600',
                        borderColor: showAdvanced ? 'var(--primary)' : 'var(--glass-border)',
                        background: showAdvanced ? 'rgba(65, 105, 225, 0.08)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    Advanced Options
                    {showAdvanced ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
                </motion.button>

                {/* Advanced Options */}
                <AnimatePresence>
                    {showAdvanced && (
                        <motion.div
                            initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                            animate={{ height: 'auto', opacity: 1, marginBottom: '1.5rem' }}
                            exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                            style={{ overflow: 'hidden' }}
                        >
                            <div className="grid-cols-2" style={{ marginBottom: '1.5rem' }}>
                                {/* Custom Alias */}
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <label style={{
                                        display: 'block',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        color: 'var(--primary)',
                                        marginBottom: '0.5rem',
                                    }}>
                                        Custom Alias (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="my-awesome-link"
                                        className="glass-input"
                                        value={customAlias}
                                        onChange={(e) => setCustomAlias(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                                        style={{ fontSize: '0.9rem' }}
                                    />
                                    <p style={{
                                        fontSize: '0.7rem',
                                        color: 'var(--text-muted)',
                                        marginTop: '0.35rem',
                                    }}>
                                        Make your URL memorable
                                    </p>
                                </motion.div>

                                {/* Expiry Date */}
                                <motion.div
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.15 }}
                                >
                                    <label style={{
                                        display: 'block',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        color: 'var(--secondary)',
                                        marginBottom: '0.5rem',
                                    }}>
                                        Expiration Date (Optional)
                                    </label>
                                    <input
                                        type="datetime-local"
                                        className="glass-input"
                                        value={expiresAt}
                                        onChange={(e) => setExpiresAt(e.target.value)}
                                        style={{ fontSize: '0.9rem' }}
                                    />
                                    <p style={{
                                        fontSize: '0.7rem',
                                        color: 'var(--text-muted)',
                                        marginTop: '0.35rem',
                                    }}>
                                        Links will expire after this date
                                    </p>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Submit Button */}
                <motion.button
                    type="submit"
                    className="btn-primary w-full"
                    disabled={loading || !urlValid}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                        fontSize: '1rem',
                        fontWeight: '700',
                        padding: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        opacity: !urlValid ? 0.5 : 1,
                    }}
                >
                    {loading ? (
                        <>
                            <div className="spinner" style={{ width: '18px', height: '18px' }} />
                            <span>Creating your link...</span>
                        </>
                    ) : (
                        <>Shorten Now</>
                    )}
                </motion.button>
            </form>

            {/* Success Result */}
            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        style={{
                            marginTop: '2rem',
                            paddingTop: '2rem',
                            borderTop: '2px solid var(--glass-border)',
                        }}
                    >
                        {/* Success Header */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div className="flex items-center gap-2" style={{ marginBottom: '0.75rem' }}>
                                <FiCheck size={24} style={{ color: 'var(--success)' }} />
                                <h3 style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--success)', margin: 0 }}>
                                    Link Created Successfully!
                                </h3>
                            </div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                                Your short URL is ready to use
                            </p>
                        </div>

                        {/* Result Display */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="glass-card"
                            style={{
                                background: 'rgba(46, 139, 87, 0.05)',
                                border: '1px solid rgba(46, 139, 87, 0.2)',
                                padding: '1.25rem',
                                marginBottom: '1.5rem',
                            }}
                        >
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                Your short URL:
                            </p>
                            <p style={{
                                fontSize: '1.25rem',
                                fontWeight: '700',
                                color: 'var(--primary)',
                                wordBreak: 'break-all',
                                margin: 0,
                                fontFamily: 'monospace',
                            }}>
                                {result.shortUrl}
                            </p>
                        </motion.div>

                        {/* Action Buttons */}
                        <div className="flex gap-3" style={{ flexWrap: 'wrap' }}>
                            <motion.button
                                onClick={copyToClipboard}
                                className="btn-primary"
                                style={{ flex: 1, minWidth: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                            >
                                <FiCopy size={18} />
                                Copy Link
                            </motion.button>
                            {typeof navigator.share === 'function' && (
                                <motion.button
                                    onClick={shareUrl}
                                    className="btn-secondary"
                                    style={{ flex: 1, minWidth: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    <FiShare2 size={18} />
                                    Share
                                </motion.button>
                            )}
                            <motion.button
                                onClick={() => setResult(null)}
                                className="btn-ghost"
                                style={{ flex: 1, minWidth: '120px' }}
                                whileHover={{ scale: 1.03 }}
                            >
                                Create Another
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ShortenForm;
