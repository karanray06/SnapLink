import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Link2, Github, Twitter } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SnapLink | Snap. Share. Track.",
  description: "A blazing fast, serverless URL shortener with advanced analytics and custom domains.",
  keywords: "url shortener, analytics, qr code, next.js, serverless",
  openGraph: {
    title: "SnapLink",
    description: "A blazing fast, serverless URL shortener with advanced analytics",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <head>
          <meta name="theme-color" content="#0A0A0F" />
        </head>
        <body
          className={`${inter.className} bg-[#0A0A0F] text-slate-100 min-h-screen flex flex-col antialiased`}
        >
          <nav className="border-b border-white/10 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tighter hover:opacity-80 transition-opacity">
                <div className="bg-gradient-to-br from-[#6C63FF] to-[#FF6584] p-2 rounded-lg text-white">
                  <Link2 size={20} />
                </div>
                <span className="hidden sm:inline bg-clip-text text-transparent bg-gradient-to-r from-[#6C63FF] to-[#FF6584]">
                  SnapLink
                </span>
              </Link>

              <div className="flex items-center gap-4">
                <SignedIn>
                  <Link
                    href="/dashboard"
                    className="text-sm font-medium text-slate-300 hover:text-white transition-colors hidden sm:inline"
                  >
                    Dashboard
                  </Link>
                </SignedIn>

                <div className="flex items-center gap-2">
                  <SignedIn>
                    <UserButton afterSignOutUrl="/" />
                  </SignedIn>
                  <SignedOut>
                    <SignInButton mode="modal">
                      <button className="text-sm font-medium bg-gradient-to-r from-[#6C63FF] to-[#FF6584] hover:opacity-90 px-4 py-2 rounded-lg transition-opacity text-white">
                        Sign In
                      </button>
                    </SignInButton>
                  </SignedOut>
                </div>
              </div>
            </div>
          </nav>

          <main className="flex-1 flex flex-col relative">{children}</main>

          <footer className="border-t border-white/10 bg-black/40 backdrop-blur-xl mt-16">
            <div className="container mx-auto px-4 py-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                <div>
                  <div className="flex items-center gap-2 font-bold text-lg mb-4">
                    <div className="bg-gradient-to-br from-[#6C63FF] to-[#FF6584] p-1.5 rounded-lg text-white">
                      <Link2 size={18} />
                    </div>
                    <span>SnapLink</span>
                  </div>
                  <p className="text-slate-400 text-sm">Serverless URL shortener with advanced analytics.</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 text-white">Product</h4>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <Link href="/" className="text-slate-400 hover:text-white transition-colors">
                        Home
                      </Link>
                    </li>
                    <li>
                      <SignedIn>
                        <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">
                          Dashboard
                        </Link>
                      </SignedIn>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 text-white">Legal</h4>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <a href="#" className="text-slate-400 hover:text-white transition-colors">
                        Privacy
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-slate-400 hover:text-white transition-colors">
                        Terms
                      </a>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 text-white">Follow</h4>
                  <div className="flex gap-3">
                    <a href="#" className="text-slate-400 hover:text-white transition-colors">
                      <Github size={20} />
                    </a>
                    <a href="#" className="text-slate-400 hover:text-white transition-colors">
                      <Twitter size={20} />
                    </a>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
                <p className="text-slate-400 text-sm">© 2024 SnapLink. All rights reserved.</p>
                <p className="text-slate-400 text-sm">
                  Built with{" "}
                  <span className="text-[#FF6584]">❤️</span> using Next.js 14,
                  Neon, and Vercel.
                </p>
              </div>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
