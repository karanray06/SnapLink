"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import Link from "next/link";
import { Copy, Trash2, BarChart3, QrCode, ExternalLink, Check } from "lucide-react";
import { formatNumber, daysSince } from "@/lib/utils";

interface LinkRecord {
  id: number;
  shortId: string;
  longUrl: string;
  customAlias: string | null;
  createdAt: string;
  expiresAt: string | null;
  clickCount: number;
}

export default function Dashboard() {
  const { isSignedIn, isLoaded } = useAuth();
  const [links, setLinks] = useState<LinkRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [qrCodeModal, setQrCodeModal] = useState<{ shortId: string } | null>(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      window.location.href = "/sign-in";
    }
  }, [isSignedIn, isLoaded]);

  useEffect(() => {
    if (isSignedIn) {
      fetchLinks();
    }
  }, [isSignedIn, page]);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/user/links?page=${page}&limit=10`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to fetch links");
        return;
      }

      setLinks(data.links);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this link?")) return;

    try {
      setDeletingId(id);
      const res = await fetch(`/api/user/links/${id}`, { method: "DELETE" });

      if (!res.ok) {
        setError("Failed to delete link");
        return;
      }

      setLinks(links.filter((link) => link.id !== id));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const copyToClipboard = (shortUrl: string, shortId: string) => {
    navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_BASE_URL}/${shortId}`);
    setCopiedId(shortId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  if (!isLoaded) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!isSignedIn) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0F] via-[#1a1a2e] to-[#0A0A0F] text-white">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">Your Links</h1>
          <p className="text-slate-400">Manage and track all your shortened URLs</p>
        </motion.div>

        {error && (
          <div className="bg-red-950/30 border border-red-900/50 text-red-300 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#6C63FF]"></div>
          </div>
        ) : links.length === 0 ? (
          <div className="text-center py-16 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
            <p className="text-slate-400 mb-4">No links yet. Create your first short link on the homepage!</p>
            <Link href="/" className="inline-block px-6 py-2 bg-gradient-to-r from-[#6C63FF] to-[#FF6584] text-white rounded-lg hover:opacity-90">
              Create Link
            </Link>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {links.map((link) => (
              <motion.div
                key={link.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-4 rounded-lg border ${
                  isExpired(link.expiresAt)
                    ? "bg-black/30 border-red-900/30"
                    : "bg-white/5 border-white/10"
                } backdrop-blur-sm hover:bg-white/10 transition-colors`}
              >
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                  <div className="col-span-1 md:col-span-2">
                    <p className="text-sm text-slate-400">Short URL</p>
                    <p className="font-mono text-[#00D4FF] truncate">
                      {process.env.NEXT_PUBLIC_BASE_URL}/{link.shortId}
                    </p>
                  </div>

                  <div className="col-span-1 md:col-span-2">
                    <p className="text-sm text-slate-400">Long URL</p>
                    <p className="truncate text-slate-300 text-sm">{link.longUrl}</p>
                  </div>

                  <div className="col-span-1">
                    <p className="text-sm text-slate-400">Clicks</p>
                    <p className="font-bold text-lg">{formatNumber(link.clickCount)}</p>
                  </div>

                  <div className="col-span-1 md:col-span-5">
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                      <div className="text-sm">
                        <span className="text-slate-400 block">Created</span>
                        <span className="text-slate-300">{daysSince(new Date(link.createdAt))}d ago</span>
                      </div>

                      <div className="text-sm">
                        <span className="text-slate-400 block">Status</span>
                        <span className={isExpired(link.expiresAt) ? "text-red-400" : "text-green-400"}>
                          {isExpired(link.expiresAt) ? "Expired" : "Active"}
                        </span>
                      </div>

                      <button
                        onClick={() => copyToClipboard(link.shortId, link.shortId)}
                        className="p-2 rounded bg-white/10 hover:bg-white/20 transition-colors"
                        title="Copy to clipboard"
                      >
                        {copiedId === link.shortId ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        onClick={() => setQrCodeModal({ shortId: link.shortId })}
                        className="p-2 rounded bg-white/10 hover:bg-white/20 transition-colors"
                        title="View QR code"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>

                      <Link
                        href={`/${link.shortId}/stats`}
                        className="p-2 rounded bg-white/10 hover:bg-white/20 transition-colors inline-flex items-center justify-center"
                        title="View analytics"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </Link>

                      <button
                        onClick={() => handleDelete(link.id)}
                        disabled={deletingId === link.id}
                        className="p-2 rounded bg-red-950/30 hover:bg-red-900/30 transition-colors"
                        title="Delete link"
                      >
                        {deletingId === link.id ? (
                          <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 text-red-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-4 py-2">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {qrCodeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#0f0f13] border border-white/10 rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-xl font-bold mb-4">QR Code</h3>
            <div className="bg-white p-4 rounded-lg inline-block w-full flex items-center justify-center mb-4">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${process.env.NEXT_PUBLIC_BASE_URL}/${qrCodeModal.shortId}`}
                alt="QR Code"
                className="w-48 h-48"
              />
            </div>
            <button
              onClick={() => setQrCodeModal(null)}
              className="w-full py-2 bg-gradient-to-r from-[#6C63FF] to-[#FF6584] text-white rounded-lg hover:opacity-90"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
