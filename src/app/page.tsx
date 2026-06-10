"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Link2, Copy, Check, BarChart2, Zap, Shield, ArrowRight } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export default function Home() {
  const [longUrl, setLongUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ shortUrl: string; shortId: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ longUrl, customAlias, expiresAt: expiresAt || undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden bg-[#0A0A0F]">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#6C63FF]/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#FF6584]/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 py-20 flex-1 flex flex-col items-center justify-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
            Snap. Share. Track.
          </h1>
          <p className="text-lg md:text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            The ultimate serverless URL shortener. Lightning fast redirects at the edge, advanced analytics, and custom domains.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-xl"
        >
          <Card className="p-1 bg-white/5 border-white/10 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden">
            <div className="bg-[#0f0f13] rounded-xl p-6 md:p-8 relative overflow-hidden">
              <AnimatePresence mode="wait">
                {!result ? (
                  <motion.form 
                    key="form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleSubmit} 
                    className="relative z-10 flex flex-col gap-5"
                  >
                    
                    <div className="space-y-2">
                      <Label htmlFor="longUrl" className="text-slate-300">Long URL</Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Link2 className="h-5 w-5 text-slate-500" />
                        </div>
                        <Input
                          id="longUrl"
                          type="url"
                          placeholder="https://your-very-long-url.com/some/path"
                          required
                          value={longUrl}
                          onChange={(e) => setLongUrl(e.target.value)}
                          className="pl-10 bg-black/40 border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-[#6C63FF] h-12"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="customAlias" className="text-slate-300">Custom Alias (Optional)</Label>
                        <Input
                          id="customAlias"
                          type="text"
                          placeholder="e.g. my-campaign"
                          value={customAlias}
                          onChange={(e) => setCustomAlias(e.target.value)}
                          className="bg-black/40 border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-[#6C63FF]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="expiresAt" className="text-slate-300">Expiry Date (Optional)</Label>
                        <Input
                          id="expiresAt"
                          type="datetime-local"
                          value={expiresAt}
                          onChange={(e) => setExpiresAt(e.target.value)}
                          className="bg-black/40 border-slate-800 text-white focus-visible:ring-[#6C63FF] color-scheme-dark"
                          style={{ colorScheme: 'dark' }}
                        />
                      </div>
                    </div>

                    {error && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm bg-red-950/30 p-3 rounded-lg border border-red-900/50">
                        {error}
                      </motion.div>
                    )}

                    <Button 
                      type="submit" 
                      disabled={loading || !longUrl}
                      className="w-full h-12 mt-2 bg-gradient-to-r from-[#6C63FF] to-[#FF6584] hover:opacity-90 text-white font-medium text-lg transition-all"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Shortening...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>Shorten It</span>
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      )}
                    </Button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="flex flex-col justify-center items-center py-4"
                  >
                    <div className="w-full max-w-sm space-y-8 text-center">
                      <div className="bg-white p-4 rounded-xl inline-block mx-auto shadow-lg">
                        <QRCodeSVG value={result.shortUrl} size={180} />
                      </div>
                      
                      <div className="space-y-3">
                        <p className="text-sm text-slate-400 font-medium">Your short link is ready to share!</p>
                        <div className="flex items-center gap-2 bg-black/50 border border-slate-800 p-2 rounded-lg">
                          <Input 
                            readOnly 
                            value={result.shortUrl} 
                            className="border-none bg-transparent focus-visible:ring-0 text-[#00D4FF] font-medium text-lg h-10"
                          />
                          <Button 
                            variant="secondary" 
                            size="icon" 
                            onClick={copyToClipboard}
                            className="shrink-0 bg-[#6C63FF]/20 hover:bg-[#6C63FF]/40 text-[#6C63FF] border-none h-10 w-10"
                          >
                            {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                          </Button>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4 border-t border-slate-800/50">
                        <Button variant="outline" className="border-slate-700 bg-transparent hover:bg-white/5 w-full sm:w-auto" onClick={() => setResult(null)}>
                          Shorten Another
                        </Button>
                        <Button variant="outline" className="border-slate-700 bg-[#6C63FF]/10 hover:bg-[#6C63FF]/20 text-[#6C63FF] w-full sm:w-auto" asChild>
                          <a href={`/${result.shortId}/stats`} target="_blank" rel="noreferrer">
                            View Analytics
                          </a>
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Card>
        </motion.div>

        {/* Features Below the Fold */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-5xl mx-auto px-4">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#6C63FF]/20 flex items-center justify-center text-[#6C63FF]">
              <Zap size={24} />
            </div>
            <h3 className="text-xl font-bold text-white">Edge Powered Speed</h3>
            <p className="text-slate-400 text-sm">Redirects happen globally at the edge with <span className="text-white">Upstash Redis</span>, ensuring sub-50ms latency anywhere in the world.</p>
          </div>
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FF6584]/20 flex items-center justify-center text-[#FF6584]">
              <BarChart2 size={24} />
            </div>
            <h3 className="text-xl font-bold text-white">Deep Analytics</h3>
            <p className="text-slate-400 text-sm">Track referrers, device types, and geographic locations for every single click in real-time.</p>
          </div>
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#00D4FF]/20 flex items-center justify-center text-[#00D4FF]">
              <Shield size={24} />
            </div>
            <h3 className="text-xl font-bold text-white">Secure & Reliable</h3>
            <p className="text-slate-400 text-sm">Built on a <span className="text-white">Serverless PostgreSQL</span> architecture for infinite scalability and zero downtime.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
