// src/app/dashboard/page.jsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Mail, Inbox, Send, Activity, BarChart2,
  Shield, CheckCircle, AlertTriangle, X,
  User, Zap, Menu, Loader, Star, Clock, MoreVertical
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import AssistantChat from '@/components/AssistantChatPhase2';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [aliases, setAliases] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [inboxStats, setInboxStats] = useState({ unreadCount: 0, totalEmails: 0, spamCount: 0 });
  const [refreshing, setRefreshing] = useState(false);
  const [pollingAttempts, setPollingAttempts] = useState(0);
  const [useWebhook, setUseWebhook] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('upgraded') === 'true') {
      setSuccess('Payment successful! Verifying your Pro plan upgrade...');
      setRefreshing(true);
      window.history.replaceState({}, document.title, window.location.pathname);
      pollForPlanUpdate();
      setTimeout(() => {
        if (user?.plan !== 'pro') verifyPaymentDirectly();
      }, 15000);
    } else {
      fetchUserData();
    }
    fetchAliases();
    fetchInboxStats();
    fetchActivities();
  }, [user?.plan]);

  const verifyPaymentDirectly = async () => {
    try {
      const response = await fetch('/api/upgrade/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user?.plan === 'pro') {
          setUser(data.user);
          setSuccess('🎉 Successfully upgraded to Pro!');
          setRefreshing(false);
          setUseWebhook(false);
          fetchAliases();
          fetchInboxStats();
          return true;
        } else if (pollingAttempts < 20) {
          setPollingAttempts(prev => prev + 1);
          setTimeout(verifyPaymentDirectly, 5000);
        } else {
          setError('Unable to verify payment. Please contact support.');
          setRefreshing(false);
        }
      }
      return false;
    } catch (error) {
      console.error('[Fallback] Error:', error);
      return false;
    }
  };

  const pollForPlanUpdate = async (maxAttempts = 10, attemptCount = 0) => {
    if (!useWebhook) return;
    setPollingAttempts(attemptCount + 1);
    try {
      const timestamp = Date.now();
      const response = await fetch(`/api/user?t=${timestamp}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' }
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        if (userData.plan === 'pro') {
          setSuccess('🎉 Successfully upgraded to Pro!');
          setRefreshing(false);
          fetchAliases();
          fetchInboxStats();
          return;
        }
      }
      if (attemptCount < maxAttempts) {
        setTimeout(() => pollForPlanUpdate(maxAttempts, attemptCount + 1), 3000);
      }
    } catch (error) {
      if (attemptCount < maxAttempts) {
        setTimeout(() => pollForPlanUpdate(maxAttempts, attemptCount + 1), 3000);
      }
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await fetch(`/api/user?t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
      });
      if (response.ok) {
        setUser(await response.json());
      } else {
        router.push('/signin');
      }
    } catch (error) {
      setError('Failed to load user data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAliases = async () => {
    try {
      const response = await fetch('/api/aliases');
      if (response.ok) setAliases(await response.json());
    } catch (error) { console.error('Error fetching aliases:', error); }
  };

  const fetchInboxStats = async () => {
    try {
      const response = await fetch('/api/inbox/stats');
      if (response.ok) setInboxStats(await response.json());
    } catch (error) { console.error('Error fetching inbox stats:', error); }
  };

  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/activities');
      if (response.ok) setActivities(await response.json());
    } catch (error) { console.error('Error fetching activities:', error); }
  };

  const totalSent = activities.filter(a => a.type === 'sent').length;

  const loadRazorpayScript = () => new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const handleUpgrade = async () => {
    try {
      setError('');
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) { setError('Failed to load payment system.'); return; }
      const response = await fetch('/api/upgrade', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
      if (response.ok) {
        const { order, user: userInfo } = await response.json();
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: order.amount, currency: order.currency,
          name: 'InvisiMail Pro', description: 'Upgrade to Pro Plan', order_id: order.id,
          handler: function (response) { window.location.href = '/dashboard?upgraded=true'; },
          prefill: { email: userInfo?.email || user?.email, name: userInfo?.name || user?.name },
          theme: { color: '#7c3aed' },
          modal: { ondismiss: function () { setError('Payment cancelled.'); } }
        };
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) { setError(`Payment failed: ${response.error.description}`); });
        rzp.open();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create payment order');
      }
    } catch (error) { setError('Failed to initiate upgrade process'); }
  };

  const handleManualRefresh = () => { setError(''); setSuccess('Checking payment status...'); verifyPaymentDirectly(); };

  // Loading state
  if (loading || refreshing) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-xl font-semibold text-white mb-2">
            {refreshing ? 'Verifying Your Upgrade' : 'Loading Dashboard'}
          </h2>
          <p className="text-sm text-[#A1A1AA]">
            {refreshing ? 'This just takes a moment...' : 'Preparing your workspace.'}
          </p>
          {refreshing && (
            <button onClick={handleManualRefresh} className="btn-secondary mt-6 text-sm cursor-pointer">
              <Loader className="mr-2" /> Verify Manually
            </button>
          )}
        </div>
      </div>
    );
  }

  const isPro = user?.plan === 'pro';

  const trafficData = [
    { name: 'Mon', emails: 10 }, { name: 'Tue', emails: 18 }, { name: 'Wed', emails: 14 },
    { name: 'Thu', emails: 22 }, { name: 'Fri', emails: 16 }, { name: 'Sat', emails: 24 }, { name: 'Sun', emails: 20 },
  ];

  const spamData = [
    { name: 'Legitimate', value: Math.max(0, (inboxStats.totalEmails || 0) - (inboxStats.spamCount || 0)) },
    { name: 'Spam', value: inboxStats.spamCount || 0 },
  ];
  const hasEmailData = spamData.some(item => item.value > 0);
  const displaySpamData = hasEmailData ? spamData : [{ name: 'No Data', value: 1 }];
  const pieColors = ['#6366F1', '#3F3F46'];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'sent': return <Send className="text-primary w-4 h-4" />;
      case 'received': return <Inbox className="text-green-400 w-4 h-4" />;
      case 'blocked': return <Shield className="text-red-400 w-4 h-4" />;
      default: return <Mail className="text-[#A1A1AA] w-4 h-4" />;
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
  const item = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

  const customTooltip = {
    contentStyle: {
      background: 'rgba(9,9,15,0.95)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '12px',
      backdropFilter: 'blur(8px)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    },
    itemStyle: { color: '#f0f0f5' },
    labelStyle: { color: '#8b8b9e' },
  };

  return (
    <div className="flex h-full bg-[#09090B] text-white relative overflow-hidden">
      {/* Clean Dashboard Background (No Ambient Glows) */}
      <div className="absolute top-0 left-[20%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none opacity-20" />

      <Sidebar user={user} onUpgrade={handleUpgrade} isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <motion.main
          variants={container}
          initial="hidden"
          animate="visible"
          className="flex-1 overflow-y-auto p-5 md:p-8 space-y-8"
        >
          {/* Toast Notifications */}
          <div className="fixed top-5 right-5 z-50 w-full max-w-sm space-y-3">
            {error && (
              <div className="flex gap-4 alert-error p-4 rounded-xl items-start slide-up">
              <div className="p-1 bg-red-500/10 rounded-lg">
                <AlertTriangle className="text-red-400 text-lg flex-shrink-0" />
              </div>
              <div className="flex-1">
                  <p className="font-medium text-sm">{error}</p>
                  {error.includes('Unable to verify') && (
                    <button onClick={handleManualRefresh} className="text-xs text-red-400 hover:text-white mt-1 cursor-pointer">
                      Click to Verify Manually
                    </button>
                  )}
                </div>
                <button onClick={() => setError('')} className="text-red-400/60 hover:text-red-400 cursor-pointer"><X className="w-5 h-5" /></button>
              </div>
            )}
            {success && (
              <div className="flex gap-4 alert-success p-4 rounded-xl items-start slide-up">
              <div className="p-1 bg-green-500/10 rounded-lg">
                <CheckCircle className="text-green-400 text-lg flex-shrink-0" />
              </div>
                <p className="flex-1 font-medium text-sm">{success}</p>
                <button onClick={() => setSuccess('')} className="text-green-400/60 hover:text-green-400 cursor-pointer"><X className="w-5 h-5" /></button>
              </div>
            )}
          </div>

          {/* Header */}
          <motion.div variants={item} className="mb-6">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <button
                  onClick={() => setIsMobileOpen(true)}
                  className="md:hidden mt-0.5 p-2 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-3xl md:text-4xl font-semibold text-[#FAFAFA] mb-2 tracking-tight">
                    {getGreeting()}, <span className="text-white">{user?.name?.split(' ')[0] || 'User'}</span>
                  </h1>
                  <p className="text-sm text-[#A1A1AA] flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Here's what's happening with your aliases today.
                  </p>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-lg border text-xs font-semibold flex items-center gap-2 ${
                isPro 
                  ? 'bg-white/5 border-white/10 text-white' 
                  : 'bg-transparent border-white/10 text-[#A1A1AA]'
              }`}>
                <Star className={`w-3.5 h-3.5 ${isPro ? 'text-primary' : 'text-[#A1A1AA]'}`} />
                {isPro ? 'Pro Active' : 'Free Plan'}
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { label: 'Total Aliases', value: aliases.length, sub: isPro ? 'Unlimited' : `${aliases.filter(a => !a.isCollaborative).length} / 5 personal`, icon: Mail, color: 'text-[#FAFAFA]', glow: 'shadow-none', bg: 'bg-white/5 border-white/10', href: '/dashboard/aliases' },
              { label: 'Unread Emails', value: inboxStats.unreadCount, sub: 'View Inbox →', icon: Inbox, color: 'text-[#FAFAFA]', glow: 'shadow-none', bg: 'bg-white/5 border-white/10', href: '/dashboard/inbox' },
              { label: 'Emails Sent', value: totalSent, sub: 'Compose New →', icon: Send, color: 'text-[#FAFAFA]', glow: 'shadow-none', bg: 'bg-white/5 border-white/10', href: '/dashboard/send' },
            ].map((stat) => (
              <motion.a key={stat.label} href={stat.href} variants={item} className="surface-card p-5 rounded-2xl block group hover:bg-[#111113] transition-all border border-white/5 hover:border-white/10">
                <div className="flex justify-between items-start mb-4">
                  <p className="text-sm font-medium text-[#A1A1AA]">{stat.label}</p>
                  <div className={`p-2.5 rounded-xl border ${stat.bg} ${stat.color} ${stat.glow}`}>
                    <stat.icon className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-3xl font-semibold text-[#FAFAFA] mb-1.5">{stat.value}</p>
                <p className="text-xs text-[#A1A1AA] font-medium">{stat.sub}</p>
              </motion.a>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div variants={item} className="surface-card p-5 rounded-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">Email Traffic</h3>
                <button className="text-[#A1A1AA] hover:text-white transition-colors"><MoreVertical className="w-4 h-4" /></button>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trafficData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
                    <XAxis dataKey="name" stroke="#52525B" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                    <YAxis stroke="#52525B" fontSize={11} tickLine={false} axisLine={false} dx={-10} />
                    <Tooltip {...customTooltip} cursor={{ stroke: '#6366F1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                    <Area type="monotone" dataKey="emails" stroke="#6366F1" strokeWidth={3} fill="url(#colorTraffic)" activeDot={{ r: 6, fill: '#6366F1', stroke: '#09090B', strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div variants={item} className="surface-card p-5 rounded-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">Spam vs. Legitimate</h3>
                <button className="text-[#A1A1AA] hover:text-white transition-colors"><MoreVertical className="w-4 h-4" /></button>
              </div>
              <div className="h-48 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={displaySpamData} cx="50%" cy="50%" innerRadius={65} outerRadius={90} paddingAngle={hasEmailData ? 5 : 0} dataKey="value" stroke="none">
                      {displaySpamData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={hasEmailData ? pieColors[index % pieColors.length] : 'rgba(255, 255, 255, 0.03)'} />
                      ))}
                    </Pie>
                    {hasEmailData && <Tooltip {...customTooltip} />}
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Center Labels */}
                {!hasEmailData && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[hsl(var(--muted-foreground))] text-xs font-semibold">Awaiting Data</span>
                  </div>
                )}
                {hasEmailData && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-white text-2xl font-bold tracking-tight">{inboxStats?.totalEmails || 0}</span>
                    <span className="text-[hsl(var(--muted-foreground))] text-[10px] uppercase tracking-wider font-semibold mt-0.5">Total</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Recent Activity Timeline */}
          <motion.div variants={item} className="surface-card p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Activity Feed</h3>
              <div className="flex gap-4">
                <a href="/dashboard/aliases" className="text-sm text-primary hover:text-white font-medium transition-colors cursor-pointer">All aliases</a>
                <a href="/dashboard/inbox" className="text-sm text-primary hover:text-white font-medium transition-colors cursor-pointer">Inbox</a>
              </div>
            </div>

            <div className="space-y-8 max-h-[500px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {/* Recent Aliases */}
              {aliases && aliases.length > 0 && (
                <div className="relative pl-6 border-l border-white/10">
                  <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-white/20" />
                  <p className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-widest mb-4">New Aliases</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {aliases
                      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                      .slice(0, 4)
                      .map((alias) => (
                        <div key={alias._id} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all hover:-translate-y-1 group">
                          <div className="flex items-center gap-4 min-w-0">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 border ${
                              alias.isCollaborative ? 'bg-primary/10 text-primary border-primary/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            }`}>
                              {alias.aliasEmail.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-white truncate">{alias.aliasEmail}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <p className="text-xs text-[#A1A1AA]">
                                  {new Date(alias.createdAt).toLocaleDateString()}
                                </p>
                                {alias.isCollaborative && <span className="badge text-[10px] py-0 px-1.5 bg-primary/20 text-primary border-primary/20">Team</span>}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <a href={`/dashboard/inbox?alias=${alias.aliasEmail}`} className="p-2 text-[#A1A1AA] hover:text-white rounded-xl hover:bg-white/10 cursor-pointer transition-colors" title="View Inbox">
                              <Inbox className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Email Activities */}
              <div className="relative pl-6 border-l border-white/10">
                <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-white/20" />
                <p className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-widest mb-4">Email Logs</p>
                {activities.length > 0 ? (
                  <div className="space-y-4">
                    {activities.slice(0, 5).map((activity, index) => {
                      const activityText = activity.description ||
                        (activity.type === 'sent' ? `Email sent to ${activity.data?.to || 'recipient'}` :
                         activity.type === 'received' ? `Email received from ${activity.data?.from || 'sender'}` :
                         activity.type === 'blocked' ? `Email blocked from ${activity.data?.from || 'sender'}` :
                         'Activity logged');
                      const activityTime = activity.timestamp || activity.createdAt;
                      const aliasEmail = activity.aliasId ?
                        aliases.find(a => a._id === activity.aliasId || a.id === activity.aliasId)?.aliasEmail || 'Unknown' :
                        activity.data?.aliasEmail || '';

                      return (
                        <div key={activity._id || activity.id || index} className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all hover:translate-x-1 group">
                          <div className={`p-2 rounded-lg border flex-shrink-0 ${
                            activity.type === 'sent' ? 'bg-white/5 border-white/10' :
                            activity.type === 'received' ? 'bg-white/5 border-white/10' :
                            'bg-white/5 border-white/10'
                          }`}>
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="min-w-0 flex-1 pt-1">
                            <p className="text-sm font-medium text-white">{activityText}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-xs font-medium text-[#A1A1AA]">
                                {activityTime ? new Date(activityTime).toLocaleString([], {hour: '2-digit', minute:'2-digit', month:'short', day:'numeric'}) : 'Recent'}
                              </p>
                              {aliasEmail && (
                                <>
                                  <span className="w-1 h-1 rounded-full bg-white/20" />
                                  <span className="text-xs text-primary/80">{aliasEmail}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center rounded-2xl border border-white/5 border-dashed">
                    <Mail className="w-8 h-8 text-[#A1A1AA]/50 mx-auto mb-3" />
                    <p className="text-sm text-[#A1A1AA]">No recent email activities.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.footer variants={item} className="pt-6 border-t border-white/5 text-sm text-[#A1A1AA]">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <p>&copy; {new Date().getFullYear()} InvisiMail. All rights reserved.</p>
              <div className="flex items-center gap-6">
                <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
                <a href="/terms" className="hover:text-white transition-colors">Terms</a>
              </div>
            </div>
          </motion.footer>
        </motion.main>
      </div>

      <AssistantChat />
    </div>
  );
}