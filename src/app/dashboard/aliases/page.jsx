// src/app/dashboard/aliases/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import AliasesOverview from '@/components/AliasesOverview';
import AssistantChat from '@/components/AssistantChatPhase2';

export default function AllAliasesPage() {
  const [user, setUser] = useState(null);
  const [aliases, setAliases] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [toggleLoading, setToggleLoading] = useState({});
  const [managingAliasId, setManagingAliasId] = useState(null);
  const [addEmail, setAddEmail] = useState('');
  const [addRole, setAddRole] = useState('member');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchUserData();
    fetchAliases();
    fetchActivities();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user');
      if (response.ok) {
        setUser(await response.json());
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

  const fetchAliases = async () => {
    try {
      const response = await fetch('/api/aliases');
      if (response.ok) setAliases(await response.json());
    } catch (error) { console.error('Error fetching aliases:', error); }
  };

  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/shared-activities');
      if (response.ok) setActivities(await response.json());
    } catch (error) { console.error('Error fetching activities:', error); }
  };

  const handleToggleStatus = async (aliasId, currentStatus) => {
    setToggleLoading(prev => ({ ...prev, [aliasId]: true }));
    try {
      const response = await fetch('/api/aliases', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aliasId, isActive: !currentStatus })
      });
      if (response.ok) {
        const data = await response.json();
        setAliases(prev => prev.map(alias => alias._id === aliasId ? data.alias : alias));
        setSuccess(`Alias ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update alias');
      }
    } catch (error) {
      setError('Network error while updating alias');
    } finally {
      setToggleLoading(prev => ({ ...prev, [aliasId]: false }));
    }
  };

  const handleDelete = async (aliasId) => {
    if (!confirm('Are you sure you want to delete this alias? This action cannot be undone.')) return;
    try {
      const response = await fetch(`/api/aliases/${aliasId}`, { method: 'DELETE' });
      if (response.ok) {
        setAliases(prev => prev.filter(alias => alias._id !== aliasId));
        setSuccess('Alias deleted successfully');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete alias');
      }
    } catch (error) {
      setError('Network error while deleting alias');
    }
  };

  const handleAddCollaborator = async (aliasId, email, role) => {
    if (!email.trim()) { setError('Please enter a valid email address'); return; }
    try {
      const response = await fetch('/api/aliases', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aliasId, action: 'addCollaborator', userEmail: email.trim(), role })
      });
      if (response.ok) {
        const data = await response.json();
        setAliases(prev => prev.map(alias => alias._id === aliasId ? data.alias : alias));
        setSuccess('Collaborator added successfully');
        setAddEmail('');
        setManagingAliasId(null);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to add collaborator');
      }
    } catch (error) {
      setError('Network error while adding collaborator');
    }
  };

  const handleRemoveCollaborator = async (aliasId, collaboratorId) => {
    if (!confirm('Are you sure you want to remove this collaborator?')) return;
    try {
      const response = await fetch('/api/aliases', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aliasId, action: 'removeCollaborator', collaboratorId })
      });
      if (response.ok) {
        const data = await response.json();
        setAliases(prev => prev.map(alias => alias._id === aliasId ? data.alias : alias));
        setSuccess('Collaborator removed successfully');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to remove collaborator');
      }
    } catch (error) {
      setError('Network error while removing collaborator');
    }
  };

  const handleUpgrade = async () => {
    try {
      const response = await fetch('/api/upgrade', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
      if (response.ok) {
        const { order } = await response.json();
        if (window.Razorpay) {
          const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            amount: order.amount, currency: order.currency,
            name: 'InvisiMail Pro', description: 'Upgrade to Pro Plan', order_id: order.id,
            handler: function (response) { window.location.href = '/dashboard?upgraded=true'; },
            prefill: { email: user?.email, name: user?.name }
          };
          const rzp = new window.Razorpay(options);
          rzp.open();
        } else {
          setError('Payment system not loaded. Please refresh and try again.');
        }
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create payment order');
      }
    } catch (error) {
      setError('Failed to initiate upgrade process');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Loading aliases...</p>
        </div>
      </div>
    );
  }

  const isPro = user?.plan === 'pro';

  return (
    <div className="flex h-screen bg-[#09090B] text-white overflow-hidden relative">
      {/* Ambient Gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-[20%] w-[400px] h-[400px] bg-violet-500/10 rounded-full blur-[120px] pointer-events-none" />

      <Sidebar user={user} onUpgrade={handleUpgrade} isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <header className="relative px-5 md:px-8 py-6 bg-white/[0.02] border-b border-white/5 backdrop-blur-md overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-30 pointer-events-none" />
          <div className="flex items-center gap-4 relative z-10">
            <button onClick={() => setIsMobileOpen(true)} className="md:hidden p-2 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">All Email Aliases</h1>
              <p className="text-sm text-[#A1A1AA] mt-1">
                Manage all your email aliases — personal and collaborative.
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

          <AliasesOverview
            user={user}
            aliases={aliases}
            activities={activities}
            isPro={isPro}
            toggleLoading={toggleLoading}
            managingAliasId={managingAliasId}
            addEmail={addEmail}
            addRole={addRole}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDelete}
            onAddCollaborator={handleAddCollaborator}
            onRemoveCollaborator={handleRemoveCollaborator}
            setManagingAliasId={setManagingAliasId}
            setAddEmail={setAddEmail}
            setAddRole={setAddRole}
          />
        </main>
      </div>
      <AssistantChat />
    </div>
  );
}