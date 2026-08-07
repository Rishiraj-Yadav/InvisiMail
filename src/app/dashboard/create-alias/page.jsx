// src/app/dashboard/create-alias/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import CreateAliasForm from '@/components/CreateAliasForm';
import AssistantChat from '@/components/AssistantChatPhase2';

export default function CreateAliasPage() {
  const [user, setUser] = useState(null);
  const [aliases, setAliases] = useState([]);
  const [verifiedDomains, setVerifiedDomains] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState('');
  const [newAlias, setNewAlias] = useState('');
  const [isCollaborative, setIsCollaborative] = useState(false);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('upgraded') === 'true') {
      setPolling(true);
      window.history.replaceState({}, document.title, window.location.pathname);
      pollUserStatus();
    } else {
      fetchUserData();
    }
    fetchAliases();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user', { cache: 'no-store' });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        if (userData.plan === 'pro') {
          fetchVerifiedDomains();
          if (polling) {
            setSuccess('Successfully upgraded to Pro!');
            setPolling(false);
          }
        }
      } else {
        router.push('/signin');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load user data.');
    } finally {
      if (!polling) setLoading(false);
    }
  };

  const pollUserStatus = async () => {
    const maxAttempts = 10;
    const interval = 2000;
    let attempt = 0;
    while (attempt < maxAttempts) {
      await fetchUserData();
      if (user?.plan === 'pro') { setPolling(false); setLoading(false); break; }
      attempt++;
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    if (attempt >= maxAttempts) {
      setError('Failed to confirm Pro plan upgrade. Please try refreshing or contact support.');
      setPolling(false);
      setLoading(false);
    }
  };

  const fetchAliases = async () => {
    try {
      const response = await fetch('/api/aliases', { cache: 'no-store' });
      if (response.ok) setAliases(await response.json());
    } catch (error) { console.error('Error fetching aliases:', error); }
  };

  const fetchVerifiedDomains = async () => {
    try {
      const response = await fetch('/api/domains', { cache: 'no-store' });
      if (response.ok) {
        const domainData = await response.json();
        setVerifiedDomains(domainData.filter(d => d.isVerified && d.mailgunStatus === 'active'));
      }
    } catch (error) { console.error('Error fetching verified domains:', error); }
  };

  const handleCreateAlias = async (e, domain) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch('/api/aliases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alias: newAlias.trim(),
          isCollaborative,
          domain: domain || process.env.NEXT_PUBLIC_MAILGUN_DOMAIN
        })
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess('Alias created successfully!');
        setNewAlias('');
        setIsCollaborative(false);
        setSelectedDomain('');
        await fetchAliases();
        setTimeout(() => { router.push('/dashboard/aliases'); }, 2000);
      } else {
        setError(data.error || 'Failed to create alias');
      }
    } catch (error) {
      setError('Network error while creating alias');
    } finally {
      setSubmitting(false);
    }
  };

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
        const { order } = await response.json();
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: order.amount, currency: order.currency,
          name: 'InvisiMail Pro', description: 'Upgrade to Pro Plan', order_id: order.id,
          handler: function (response) {
            setPolling(true); setLoading(true); pollUserStatus();
            window.location.href = '/dashboard?upgraded=true';
          },
          prefill: { email: user?.email, name: user?.name },
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
    } catch (error) {
      setError('Failed to initiate upgrade process');
    }
  };

  if (loading || polling) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{polling ? 'Verifying your Pro plan...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  const isPro = user?.plan === 'pro';
  const personalAliases = aliases.filter(a => !a.isCollaborative);
  const canCreateMore = isPro || personalAliases.length < 5;

  return (
    <div className="flex h-screen bg-[#09090B] overflow-hidden">
      <Sidebar user={user} onUpgrade={handleUpgrade} isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="surface-elevated rounded-none border-x-0 border-t-0 px-5 md:px-8 py-5">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileOpen(true)} className="md:hidden p-2 rounded-lg text-[hsl(var(--muted-foreground))] hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white">Create New Alias</h1>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">
                Create a new email alias to receive emails at a custom address.
              </p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-5 md:p-8">
          {error && (
            <div className="mb-5 alert-error p-3 rounded-xl text-sm">{error}</div>
          )}
          {success && (
            <div className="mb-5 alert-success p-3 rounded-xl text-sm">{success}</div>
          )}

          <div className="max-w-2xl">
            <CreateAliasForm
              isPro={isPro}
              personalAliasesCount={personalAliases.length}
              canCreateMore={canCreateMore}
              newAlias={newAlias}
              isCollaborative={isCollaborative}
              submitting={submitting}
              verifiedDomains={verifiedDomains}
              selectedDomain={selectedDomain}
              setSelectedDomain={setSelectedDomain}
              handleCreateAlias={handleCreateAlias}
              setNewAlias={setNewAlias}
              setIsCollaborative={setIsCollaborative}
            />
          </div>
        </main>
      </div>
      <AssistantChat />
    </div>
  );
}