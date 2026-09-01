'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Shield, Zap, Inbox, Loader2 } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export default function SignIn() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const msg = searchParams.get('message');
    if (msg) setMessage(msg);
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        signal: controller.signal,
        credentials: 'include',
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const redirectPath = data.user?.role === 'admin' ? '/admin' : '/dashboard';
        window.location.href = redirectPath;
      } else {
        const data = await response.json();
        setError(data.error || 'Sign in failed. Please check your credentials.');
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Request timed out. Please try again.');
      } else {
        setError('A network error occurred. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden selection:bg-[#6366F1]/50 selection:text-foreground p-6">
      {/* Background decorations matching LandingPage */}
      <div className="absolute top-[20%] left-[20%] w-[40%] h-[40%] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.08)_0%,transparent_70%)]" />
      <div className="absolute bottom-[20%] right-[20%] w-[30%] h-[30%] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.05)_0%,transparent_70%)]" />

      <motion.div 
        initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }}
        className="w-full max-w-[420px] relative z-10"
      >
        <motion.div variants={fadeUp} className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#4F46E5] flex items-center justify-center text-foreground shadow-lg shadow-[#6366F1]/20 group-hover:scale-105 transition-transform">
              <Mail className="w-6 h-6" />
            </div>
          </Link>
        </motion.div>

        <motion.div variants={fadeUp} className="flex justify-end mb-4">
          <ThemeToggle compact />
        </motion.div>

        <motion.div variants={fadeUp} className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground tracking-tight mb-2">Welcome back</h1>
          <p className="text-muted-foreground">Sign in to your account to continue.</p>
        </motion.div>

        <motion.div variants={fadeUp} className="bg-card/80 backdrop-blur-xl border border-border p-8 rounded-3xl shadow-2xl">
          {message && (
            <div className="alert-success mb-6 p-3 rounded-xl text-sm">
              {message}
            </div>
          )}
          {error && (
            <div className="alert-error mb-6 p-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-muted-foreground mb-1.5">Email address</label>
              <input
                id="email" type="email" name="email"
                placeholder="you@example.com"
                value={formData.email} onChange={handleChange}
                required disabled={loading}
                className="w-full h-12 px-4 rounded-xl text-sm font-medium transition-all bg-background border border-border text-foreground placeholder-[#A1A1AA]/50 focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]"
                autoComplete="email"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-muted-foreground mb-1.5">Password</label>
              <input
                id="password" type="password" name="password"
                placeholder="••••••••"
                value={formData.password} onChange={handleChange}
                required disabled={loading}
                className="w-full h-12 px-4 rounded-xl text-sm font-medium transition-all bg-background border border-border text-foreground placeholder-[#A1A1AA]/50 focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]"
                autoComplete="current-password"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit" disabled={loading}
                className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-xl flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Signing in...</>
                ) : (
                  <>Sign In <ArrowRight className="w-4 h-4 ml-2" /></>
                )}
              </button>
            </div>
          </form>
        </motion.div>

        <motion.p variants={fadeUp} className="text-center text-sm text-muted-foreground mt-8">
          Don't have an account?{' '}
          <Link href="/register" className="text-foreground hover:text-[#6366F1] font-semibold transition-colors">
            Create one
          </Link>
        </motion.p>
      </motion.div>
    </main>
  );
}