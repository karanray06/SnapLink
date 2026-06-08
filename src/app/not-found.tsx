import Link from "next/link";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0F] via-[#1a1a2e] to-[#0A0A0F] flex flex-col items-center justify-center px-4 text-white relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-red-800/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center relative z-10"
      >
        <motion.div
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="mb-6"
        >
          <AlertCircle className="w-24 h-24 text-red-400 mx-auto" />
        </motion.div>

        <h1 className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-[#FF6584] mb-4">
          404
        </h1>
        
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Link Not Found or Expired
        </h2>
        
        <p className="text-slate-400 max-w-md mx-auto mb-8 text-lg">
          The short link you clicked on either doesn't exist, has been deleted, or has passed its expiration date.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-8 py-3 bg-gradient-to-r from-[#6C63FF] to-[#FF6584] hover:opacity-90 text-white font-medium rounded-lg transition-all"
          >
            Return Home
          </Link>
          
          <Link
            href="/dashboard"
            className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-all"
          >
            View My Links
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
