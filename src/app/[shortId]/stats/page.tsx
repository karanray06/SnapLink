"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { TrendingUp, Globe, Smartphone, ExternalLink } from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface Analytics {
  shortId: string;
  longUrl: string;
  totalClicks: number;
  clicksByCountry: Array<{ country: string; count: number }>;
  clicksByDevice: Array<{ device: string; count: number }>;
  topReferrers: Array<{ referrer: string; count: number }>;
  timeline: Array<{ date: string; count: number }>;
  createdAt: string;
}

export default function StatsPage() {
  const params = useParams();
  const shortId = params.shortId as string;
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/analytics/${shortId}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to fetch analytics");
          return;
        }

        setAnalytics(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (shortId) {
      fetchAnalytics();
    }
  }, [shortId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#0A0A0F] via-[#1a1a2e] to-[#0A0A0F]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#6C63FF]"></div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#0A0A0F] via-[#1a1a2e] to-[#0A0A0F] text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Link not found</h1>
          <p className="text-slate-400">{error || "This link doesn't exist or has expired."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0F] via-[#1a1a2e] to-[#0A0A0F] text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">Analytics</h1>
          <p className="text-slate-400">{analytics.shortId}</p>
        </motion.div>

        {/* Metrics Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <MetricCard
            icon={TrendingUp}
            label="Total Clicks"
            value={formatNumber(analytics.totalClicks)}
          />
          <MetricCard
            icon={Globe}
            label="Countries"
            value={analytics.clicksByCountry.length.toString()}
          />
          <MetricCard
            icon={Smartphone}
            label="Devices"
            value={analytics.clicksByDevice.length.toString()}
          />
        </motion.div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Countries */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm"
          >
            <h2 className="text-xl font-bold mb-4">Top Countries</h2>
            <div className="space-y-3">
              {analytics.clicksByCountry.length > 0 ? (
                analytics.clicksByCountry.map((country) => (
                  <div key={country.country} className="flex justify-between items-center">
                    <span className="text-slate-300">{country.country}</span>
                    <div className="flex items-center gap-2">
                      <div className="bg-gradient-to-r from-[#6C63FF] to-[#FF6584] h-2 rounded-full" style={{
                        width: `${(country.count / analytics.totalClicks) * 100}px`,
                        maxWidth: '100px'
                      }} />
                      <span className="text-slate-400 min-w-12 text-right">{formatNumber(country.count)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400">No data</p>
              )}
            </div>
          </motion.div>

          {/* Devices */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm"
          >
            <h2 className="text-xl font-bold mb-4">By Device</h2>
            <div className="space-y-3">
              {analytics.clicksByDevice.length > 0 ? (
                analytics.clicksByDevice.map((device) => (
                  <div key={device.device} className="flex justify-between items-center">
                    <span className="text-slate-300">{device.device}</span>
                    <div className="flex items-center gap-2">
                      <div className="bg-gradient-to-r from-[#00D4FF] to-[#6C63FF] h-2 rounded-full" style={{
                        width: `${(device.count / analytics.totalClicks) * 100}px`,
                        maxWidth: '100px'
                      }} />
                      <span className="text-slate-400 min-w-12 text-right">{formatNumber(device.count)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400">No data</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Referrers */}
        {analytics.topReferrers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm mb-8"
          >
            <h2 className="text-xl font-bold mb-4">Top Referrers</h2>
            <div className="space-y-2">
              {analytics.topReferrers.map((referrer) => (
                <div key={referrer.referrer} className="flex justify-between items-center p-2 hover:bg-white/5 rounded transition-colors">
                  <a
                    href={referrer.referrer.startsWith("http") ? referrer.referrer : `https://${referrer.referrer}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[#00D4FF] hover:underline truncate flex-1"
                  >
                    <ExternalLink className="w-4 h-4 shrink-0" />
                    <span className="truncate text-sm">{referrer.referrer}</span>
                  </a>
                  <span className="text-slate-400 ml-4 shrink-0">{formatNumber(referrer.count)}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Timeline Chart */}
        {analytics.timeline.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm"
          >
            <h2 className="text-xl font-bold mb-4">Clicks Over Time</h2>
            <div className="h-64 flex items-end gap-1">
              {analytics.timeline.map((day) => {
                const maxCount = Math.max(...analytics.timeline.map(d => d.count), 1);
                const height = (day.count / maxCount) * 100;

                return (
                  <div
                    key={day.date}
                    className="flex-1 bg-gradient-to-t from-[#6C63FF] to-[#FF6584] rounded-t opacity-80 hover:opacity-100 transition-opacity group relative"
                    style={{ height: `${height}%`, minHeight: '4px' }}
                    title={`${day.date}: ${day.count} clicks`}
                  >
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity mb-2">
                      {day.date}: {day.count}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#6C63FF]/20 to-[#FF6584]/20 flex items-center justify-center">
          {Icon && <Icon className="w-6 h-6 text-[#6C63FF]" />}
        </div>
        <span className="text-slate-400 text-sm">{label}</span>
      </div>
      <p className="text-3xl font-bold">{value}</p>
    </motion.div>
  );
}
