// src/app/dashboard/domains/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import DomainManagement from '@/components/DomainManagement';
import AssistantChatPhase2 from '@/components/AssistantChatPhase2';
import { X, Menu } from 'lucide-react';

export default function DomainsPage() {
  const [user, setUser] = useState(null);
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        if (userData.plan !== 'pro') {
          setError('Custom domains are a Pro feature. Please upgrade to access.');
          setTimeout(() => router.push('/dashboard'), 3000);
        } else {
          fetchDomains();
        }
      } else {
        router.push('/signin');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load user data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDomains = async () => {
    try {
      const response = await fetch('/api/domains');
      if (response.ok) {
        const domainData = await response.json();
        setDomains(domainData);
      }
    } catch (error) {
      console.error('Error fetching domains:', error);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleUpgrade = async () => {
    try {
      setError('');
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError('Failed to load payment system. Please try again.');
        return;
      }

      const response = await fetch('/api/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const { order } = await response.json();
        
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: order.currency,
          name: 'Email Alias Pro',
          description: 'Upgrade to Pro Plan - Unlimited aliases & collaboration',
          order_id: order.id,
          handler: function (response) {
            window.location.href = '/dashboard?upgraded=true';
          },
          prefill: {
            email: user?.email,
            name: user?.name
          },
          theme: {
            color: '#3B82F6'
          },
          modal: {
            ondismiss: function () {
              setError('Payment cancelled. You can try again anytime.');
            }
          }
        };
        
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          setError(`Payment failed: ${response.error.description}`);
        });
        rzp.open();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create payment order');
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      setError('Failed to initiate upgrade process');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Loading...</p>
        </div>
      </div>
    );
  }

  const isPro = user?.plan === 'pro';

  if (!isPro) {
    return (
      <div className="flex h-screen bg-[#09090B] overflow-hidden relative">
        {/* Ambient Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-[20%] w-[400px] h-[400px] bg-violet-500/10 rounded-full blur-[120px] pointer-events-none" />

        <Sidebar user={user} onUpgrade={handleUpgrade} isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
        <div className="flex-1 flex flex-col overflow-hidden relative z-10">
          <header className="relative p-5 md:p-8 border-b border-white/5 bg-white/[0.02] backdrop-blur-md flex-shrink-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-30 pointer-events-none" />
            <div className="relative z-10 flex items-center gap-4">
              <button onClick={() => setIsMobileOpen(true)} className="md:hidden p-2 rounded-lg text-[hsl(var(--muted-foreground))] hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-white">Manage Custom Domains</h1>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
            {error && (
              <div className="alert-error p-3 rounded-xl flex justify-between items-center text-sm mb-6 max-w-4xl">
                <span>{error}</span>
                <button onClick={() => setError('')} className="p-1 hover:bg-red-500/20 rounded-full transition-colors cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            {/* ADD ASSISTANT CHAT HERE FOR NON-PRO USERS */}
            <AssistantChatPhase2 />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#09090B] overflow-hidden relative">
      {/* Ambient Gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-[20%] w-[400px] h-[400px] bg-violet-500/10 rounded-full blur-[120px] pointer-events-none" />

      <Sidebar user={user} onUpgrade={handleUpgrade} isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <header className="relative p-5 md:p-8 border-b border-white/5 bg-white/[0.02] backdrop-blur-md flex-shrink-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-30 pointer-events-none" />
          <div className="relative z-10 flex items-center gap-4">
            <button onClick={() => setIsMobileOpen(true)} className="md:hidden p-2 rounded-lg text-[hsl(var(--muted-foreground))] hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white">Manage Custom Domains</h1>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">
                Add and verify your custom domains for personalized email aliases.
              </p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
          <div className="max-w-4xl mx-auto space-y-6 pb-20">
            {error && (
              <div className="alert-error p-3 rounded-xl flex justify-between items-center text-sm">
                <span>{error}</span>
                <button onClick={() => setError('')} className="p-1 hover:bg-red-500/20 rounded-full transition-colors cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            {success && (
              <div className="alert-success p-3 rounded-xl flex justify-between items-center text-sm">
                <span>{success}</span>
                <button onClick={() => setSuccess('')} className="p-1 hover:bg-green-500/20 rounded-full transition-colors cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <DomainManagement 
              user={user} 
              onDomainsUpdate={(updatedDomains) => setDomains(updatedDomains)} 
            />
          </div>
        </main>
      </div>
      <AssistantChatPhase2 />
    </div>
  );
}