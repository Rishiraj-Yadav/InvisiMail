'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Shield, Zap, Inbox, ArrowRight, Loader2 } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        window.location.href = '/signin?message=Registration successful! Please sign in.';
      } else {
        const data = await response.json();
        setError(data.error || 'Registration failed. Please try again.');
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

  // Password strength
  const getStrength = (pw) => {
    if (!pw) return 0;
    let s = 0;
    if (pw.length >= 6) s++;
    if (pw.length >= 10) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  };
  const strength = getStrength(formData.password);
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][strength] || '';
  const strengthColor = ['', '#ef4444', '#f59e0b', '#eab308', '#22c55e', '#10b981'][strength] || '';

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
          <h1 className="text-3xl font-bold text-foreground tracking-tight mb-2">Create your account</h1>
          <p className="text-muted-foreground">Get started with InvisiMail for free.</p>
        </motion.div>

        <motion.div variants={fadeUp} className="bg-card/80 backdrop-blur-xl border border-border p-8 rounded-3xl shadow-2xl">
          {error && (
            <div className="alert-error mb-6 p-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-muted-foreground mb-1.5">Name</label>
              <input
                id="name" type="text" name="name"
                placeholder="Your name"
                value={formData.name} onChange={handleChange}
                required disabled={loading}
                className="w-full h-12 px-4 rounded-xl text-sm font-medium transition-all bg-background border border-border text-foreground placeholder-[#A1A1AA]/50 focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]"
                autoComplete="name"
              />
            </div>

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
                placeholder="Min 6 characters"
                value={formData.password} onChange={handleChange}
                required disabled={loading} minLength={6}
                className="w-full h-12 px-4 rounded-xl text-sm font-medium transition-all bg-background border border-border text-foreground placeholder-[#A1A1AA]/50 focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]"
                autoComplete="new-password"
              />
              {formData.password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 flex gap-1">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="h-1 flex-1 rounded-full transition-colors" style={{ background: i <= strength ? strengthColor : 'rgba(255,255,255,0.08)' }} />
                    ))}
                  </div>
                  <span className="text-xs font-medium" style={{ color: strengthColor }}>{strengthLabel}</span>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-muted-foreground mb-1.5">Confirm Password</label>
              <input
                id="confirmPassword" type="password" name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword} onChange={handleChange}
                required disabled={loading}
                className="w-full h-12 px-4 rounded-xl text-sm font-medium transition-all bg-background border border-border text-foreground placeholder-[#A1A1AA]/50 focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]"
                autoComplete="new-password"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit" disabled={loading}
                className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-xl flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Creating account...</>
                ) : (
                  <>Create Account <ArrowRight className="w-4 h-4 ml-2" /></>
                )}
              </button>
            </div>
          </form>
        </motion.div>

        <motion.p variants={fadeUp} className="text-center text-sm text-muted-foreground mt-8">
          Already have an account?{' '}
          <Link href="/signin" className="text-foreground hover:text-[#6366F1] font-semibold transition-colors">
            Sign in
          </Link>
        </motion.p>
      </motion.div>
    </main>
  );
}