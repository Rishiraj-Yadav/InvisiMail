'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { Send, Mail, Zap, RefreshCw, X, Menu } from 'lucide-react';
import AssistantChatPhase2 from '@/components/AssistantChatPhase2';

export default function SendEmail() {
  const [formData, setFormData] = useState({
    to: '',
    subject: '',
    message: ''
  });
  const [aliases, setAliases] = useState([]);
  const [sendableAliases, setSendableAliases] = useState([]);
  const [selectedAlias, setSelectedAlias] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [prompt, setPrompt] = useState('');
  const [replyId, setReplyId] = useState(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  // Fetch Reply Data Logic
  const fetchReplyData = useCallback(async (emailId) => {
    try {
      const response = await fetch(`/api/inbox/${emailId}`);
      if (response.ok) {
        const email = await response.json();
        // Set the alias to the one that received the original email
        if (email.aliasEmail) setSelectedAlias(email.aliasEmail);
        
        setFormData({
          to: email.from,
          subject: email.subject.startsWith('Re: ') ? email.subject : `Re: ${email.subject}`,
          message: `\n\n\n--- Original Message on ${new Date(email.date).toLocaleString()} ---\nFrom: ${email.from}\nSubject: ${email.subject}\n\n${email.bodyPlain || email.body}`
        });
      }
    } catch (error) {
      console.error('Error fetching reply data:', error);
      setError('Failed to load reply data.');
    }
  }, []);

  // 1. Initial Data Fetch (User & Aliases) - Runs once
  useEffect(() => {
    const initData = async () => {
      try {
        const [userRes, aliasRes] = await Promise.all([
          fetch('/api/user'),
          fetch('/api/aliases')
        ]);

        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData);
        }

        if (aliasRes.ok) {
          const aliasData = await aliasRes.json();
          setAliases(aliasData);
        }
      } catch (err) {
        console.error('Error initializing data:', err);
      }
    };

    initData();
  }, []);

  // 2. Handle Query Params (Reply & Pre-selected Alias)
  useEffect(() => {
    const aliasFromQuery = searchParams.get('alias');
    const replyToId = searchParams.get('reply');
    
    if (aliasFromQuery) {
      setSelectedAlias(aliasFromQuery);
    }
    
    if (replyToId) {
      setReplyId(replyToId);
      fetchReplyData(replyToId);
    }
  }, [searchParams, fetchReplyData]);

  // Filter aliases based on permissions
  useEffect(() => {
    if (user && aliases.length > 0) {
      const filtered = aliases.filter(a => {
        if (!a.isCollaborative) return true;
        if (a.ownerId.toString() === user._id.toString()) return true;
        const collab = a.collaborators?.find(c => c.userId.toString() === user._id.toString());
        return collab && (collab.role === 'member' || collab.role === 'admin');
      });
      setSendableAliases(filtered);
      
      // Only set default if nothing is selected (preserves selection from query params)
      if (!selectedAlias && filtered.length > 0) {
        setSelectedAlias(filtered[0].aliasEmail);
      }
    }
  }, [user, aliases, selectedAlias]);

  const handleAIAssist = async (mode = 'enhance') => {
    setAiLoading(true);
    setError('');
    
    try {
      // Validation
      if (mode === 'write' && !prompt.trim()) {
        throw new Error('Please enter what you want to write in the AI Assistant field.');
      }
      
      if (mode === 'enhance' && !formData.message.trim() && !formData.subject.trim()) {
        throw new Error('Please enter a subject or message to improve.');
      }

      const requestBody = {
        action: mode,
        subject: formData.subject || '',
        body: formData.message || '',
        recipient: formData.to || '',
        prompt: prompt || '',
        emailId: replyId || undefined
      };

      const res = await fetch('/api/ai/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!res.ok) {
        throw new Error(`API request failed: ${res.statusText}`);
      }

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Extract content
      let content = mode === 'write' 
        ? (data.writtenContent || data.content) 
        : (data.enhancedContent || data.content);

      if (!content) throw new Error('No content received from AI.');

      // Parse Subject/Body
      const subjectMatch = content.match(/Subject:\s*(.+?)(?:\n|$)/i);
      let newSubject = '';
      let newBody = content;

      if (subjectMatch) {
        newSubject = subjectMatch[1].trim();
        newBody = content.replace(/Subject:\s*.+?(?:\n|$)/i, '').trim();
      }

      // Update State
      if (mode === 'write') {
        setFormData({
          to: formData.to,
          subject: newSubject || 'Email Subject',
          message: newBody || content
        });
        setPrompt('');
        setSuccess('✨ Email generated successfully!');
      } else {
        setFormData(prev => ({
          ...prev,
          subject: newSubject || prev.subject,
          message: newBody || content
        }));
        setSuccess('✨ Email improved successfully!');
      }

      setTimeout(() => setSuccess(''), 3000);
        
    } catch (error) {
      console.error('Error in AI assistance:', error);
      setError(error.message || 'Failed to process AI request.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: selectedAlias,
          to: formData.to,
          subject: formData.subject,
          text: formData.message
        })
      });

      if (response.ok) {
        setSuccess('Email sent successfully!');
        setFormData({ to: '', subject: '', message: '' });
        setPrompt('');
        setTimeout(() => router.push('/dashboard/inbox'), 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to send email');
      }
    } catch (error) {
      setError('Network error while sending email');
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = () => {
    setFormData({ to: '', subject: '', message: '' });
    setPrompt('');
    setReplyId(null);
    setError('');
    setSuccess('');
    router.replace('/dashboard/send');
  };

  const handleUpgrade = async () => {
    try {
      const response = await fetch('/api/upgrade', { method: 'POST' });
      if (response.ok) {
        const { order } = await response.json();
        if (window.Razorpay) {
          const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            amount: order.amount,
            currency: order.currency,
            name: 'Email Alias Pro',
            description: 'Upgrade to Pro Plan',
            order_id: order.id,
            handler: function (response) {
              window.location.href = '/dashboard?upgraded=true';
            },
            prefill: { email: user?.email, name: user?.name }
          };
          const rzp = new window.Razorpay(options);
          rzp.open();
        }
      }
    } catch (error) {
      setError('Failed to initiate upgrade process');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      {/* Ambient Gradients Removed for Premium Look */}

      <Sidebar user={user} onUpgrade={handleUpgrade} isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden min-h-0 relative z-10">
        <header className="relative p-5 md:p-8 border-b border-white/5 bg-white/[0.02] backdrop-blur-md flex-shrink-0 overflow-hidden">
          <div className="absolute inset-0 bg-white/5 opacity-30 pointer-events-none" />
          <div className="relative z-10 flex items-center gap-4">
            <button onClick={() => setIsMobileOpen(true)} className="md:hidden p-2 rounded-lg text-[hsl(var(--muted-foreground))] hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white">Compose Email</h1>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">
                Send professional emails from your aliases with AI assistance
              </p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto min-h-0 p-4 md:p-6 scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
          <div className="max-w-4xl mx-auto space-y-6 pb-20">
            {/* Notifications */}
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

            {/* Email Form */}
            <div className="surface-card rounded-xl shadow-xl border border-white/5">
              <div className="px-6 py-4 border-b border-white/5 surface-elevated rounded-t-xl">
                <h3 className="text-lg font-bold text-white">Email Details</h3>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                
                {/* From Alias Selection */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-white" />
                      Send From Alias
                    </label>
                    <div className="relative">
                      <select
                        className="block w-full input-field appearance-none cursor-pointer text-sm font-medium"
                        value={selectedAlias}
                        onChange={(e) => setSelectedAlias(e.target.value)}
                        disabled={loading || sendableAliases.length === 0}
                        required
                      >
                        <option value="" className="bg-[#111113] text-[#FAFAFA]">Select an alias...</option>
                        {sendableAliases.map((alias) => (
                          <option key={alias._id.toString()} value={alias.aliasEmail} className="bg-[#111113] text-[#FAFAFA]">
                            {alias.aliasEmail} {alias.isCollaborative && '(Collaborative)'}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[hsl(var(--muted-foreground))]">
                        <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                      </div>
                    </div>
                  </div>

                  {/* Recipient */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      To
                    </label>
                    <input
                      type="email"
                      className="block w-full input-field text-sm font-medium"
                      value={formData.to}
                      onChange={(e) => setFormData({...formData, to: e.target.value})}
                      placeholder="recipient@example.com"
                      required
                    />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    className="block w-full input-field text-sm font-medium"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    placeholder="Email subject"
                    required
                  />
                </div>

                {/* Message Body */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Message
                  </label>
                  <textarea
                    rows={12}
                    className="block w-full input-field resize-y text-sm leading-relaxed"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    placeholder="Type your message here..."
                    required
                  />
                  <div className="flex items-center justify-end mt-2">
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      {formData.message.length} characters
                    </p>
                  </div>
                </div>

                {/* AI Assistant Section */}
                <div className="surface-interactive border border-white/10 rounded-xl p-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                    <Zap className="w-24 h-24 text-white" />
                  </div>
                  <div className="relative z-10">
                    <label className="block text-sm font-bold text-white mb-3 flex items-center">
                      <Zap className="w-4 h-4 mr-2 text-white" />
                      AI Assistant
                    </label>
                    
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        className="flex-1 input-field text-sm bg-background border-white/10"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., 'Write a polite follow-up for the invoice...'"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAIAssist('write');
                          }
                        }}
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleAIAssist('write')}
                        disabled={aiLoading || loading || !prompt.trim()}
                        className="inline-flex items-center gap-2 bg-white text-black hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed font-bold py-2.5 px-4 rounded-lg transition-all cursor-pointer"
                      >
                        {aiLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                        Generate
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAIAssist('enhance')}
                        disabled={aiLoading || loading || (!formData.subject.trim() && !formData.message.trim())}
                        className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold py-2.5 px-4 rounded-lg transition-all cursor-pointer"
                      >
                        {aiLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                        Improve Existing
                      </button>
                      
                      <button
                        type="button"
                        onClick={handleClearAll}
                        disabled={aiLoading || loading}
                        className="ml-auto text-sm text-[hsl(var(--muted-foreground))] hover:text-white transition-colors cursor-pointer"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                </div>

                {/* Submit Section */}
                <div className="flex items-center justify-end pt-6 border-t border-white/5">
                  <button
                    type="submit"
                    disabled={loading || !selectedAlias || aiLoading}
                    className="inline-flex items-center justify-center gap-2 bg-white hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3 px-8 rounded-xl transition-all cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-black/20 border-t-black"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Email
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
      <AssistantChatPhase2 />
    </div>
  );
}