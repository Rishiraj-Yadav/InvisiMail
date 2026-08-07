'use client'

import { useState, useEffect } from 'react';
import {
  Plus,
  Check,
  X,
  AlertTriangle,
  Clock,
  RefreshCw,
  Trash2,
  Copy,
  Info
} from 'lucide-react';

export default function DomainManagement({ user, onDomainsUpdate }) {
  const [domains, setDomains] = useState([]);
  const [newDomain, setNewDomain] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [copiedRecord, setCopiedRecord] = useState('');

  useEffect(() => {
    if (user?.plan === 'pro') {
      fetchDomains();
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.plan === 'pro') {
      const interval = setInterval(() => {
        fetchDomains();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchDomains = async () => {
    try {
      const response = await fetch('/api/domains');
      if (response.ok) {
        const data = await response.json();
        setDomains(data);
        if (onDomainsUpdate) {
          onDomainsUpdate(data);
        }
      } else {
        setError('Failed to fetch domains');
      }
    } catch (error) {
      console.error('Error fetching domains:', error);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDomain = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: newDomain })
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess(`Domain ${newDomain} added successfully! Please verify ownership.`);
        setNewDomain('');
        setShowAddForm(false);
        fetchDomains();
      } else {
        setError(data.error || 'Failed to add domain');
      }
    } catch (error) {
      console.error('Error adding domain:', error);
      setError('Network error while adding domain');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckMailgunStatus = async (domainId) => {
    setVerifying(prev => ({ ...prev, [`${domainId}_mailgun`]: true }));

    try {
      const response = await fetch('/api/domains', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domainId, action: 'check_mailgun_status' })
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess(data.message);
        fetchDomains();
      } else {
        setError(data.error || 'Failed to check Mailgun status');
      }
    } catch (error) {
      console.error('Error checking Mailgun status:', error);
      setError('Network error');
    } finally {
      setVerifying(prev => ({ ...prev, [`${domainId}_mailgun`]: false }));
    }
  };

  const handleDeleteDomain = async (domainId, domainName) => {
    if (!confirm(`Are you sure you want to delete domain ${domainName}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/domains?id=${domainId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess(`Domain ${domainName} deleted successfully`);
        fetchDomains();
      } else {
        setError(data.error || 'Failed to delete domain');
      }
    } catch (error) {
      console.error('Error deleting domain:', error);
      setError('Network error while deleting domain');
    }
  };

  const copyToClipboard = async (text, recordType) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedRecord(recordType);
      setTimeout(() => setCopiedRecord(''), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const getStatusIcon = (domain) => {
    if (domain.isVerified && domain.mailgunStatus === 'active') {
      return <Check className="w-5 h-5 text-green-400" />;
    } else if (domain.isVerified && domain.mailgunStatus === 'added') {
      return <Clock className="w-5 h-5 text-yellow-400" />;
    } else if (domain.isVerified) {
      return <AlertTriangle className="w-5 h-5 text-orange-400" />;
    } else {
      return <X className="w-5 h-5 text-red-400" />;
    }
  };

  const getStatusText = (domain) => {
    if (domain.isVerified && domain.mailgunStatus === 'active') {
      return 'Active';
    } else if (domain.isVerified && domain.mailgunStatus === 'added') {
      return 'Pending DNS Setup';
    } else if (domain.isVerified) {
      return 'Verified';
    } else {
      return 'Verifying Automatically...';
    }
  };

  const getStatusColor = (domain) => {
    if (domain.isVerified && domain.mailgunStatus === 'active') {
      return 'bg-green-500/20 text-green-400';
    } else if (domain.isVerified && domain.mailgunStatus === 'added') {
      return 'bg-yellow-500/20 text-yellow-400';
    } else if (domain.isVerified) {
      return 'bg-orange-500/20 text-orange-400';
    } else {
      return 'bg-red-500/20 text-red-400';
    }
  };

  const renderDnsRecords = (domain) => {
    if (!domain.mailgunDnsRecords) return null;

    const { sending_dns_records = [], receiving_dns_records = [] } = domain.mailgunDnsRecords;
    const allRecords = [...sending_dns_records, ...receiving_dns_records];

    if (allRecords.length === 0) return null;

    return (
      <div className="mt-4 space-y-3">
        <h5 className="text-sm font-semibold text-white">Required DNS Records:</h5>
        {allRecords.map((record, index) => (
          <div key={index} className="surface-interactive border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-white uppercase">{record.record_type}</span>
              <button
                onClick={() => copyToClipboard(record.value, `${domain._id}_dns_${index}`)}
                className="text-[hsl(var(--muted-foreground))] hover:text-white transition-colors cursor-pointer"
              >
                {copiedRecord === `${domain._id}_dns_${index}` ?
                  <Check className="w-4 h-4" /> :
                  <Copy className="w-4 h-4" />
                }
              </button>
            </div>
            <div className="space-y-2 text-sm text-[hsl(var(--muted-foreground))]">
              <div className="flex items-start">
                <span className="font-semibold text-white w-20 flex-shrink-0">Name:</span>
                <span className="break-all font-mono text-white/90">{record.name || '@'}</span>
              </div>
              <div className="flex items-start">
                <span className="font-semibold text-white w-20 flex-shrink-0">Value:</span>
                <span className="break-all font-mono text-white/90">{record.value}</span>
              </div>
              {record.priority && (
                <div className="flex items-center">
                  <span className="font-semibold text-white w-20 flex-shrink-0">Priority:</span>
                  <span className="font-mono text-white/90">{record.priority}</span>
                </div>
              )}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
                {record.valid === 'valid' || record.valid === true ? (
                  <>
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 font-medium">Configured</span>
                  </>
                ) : record.valid === 'unknown' ? (
                  <>
                    <Clock className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400 font-medium">Pending Verification</span>
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4 text-red-400" />
                    <span className="text-red-400 font-medium">Not Configured</span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-4">
          Add these DNS records in your domain provider's dashboard. DNS changes may take 5-60 minutes to propagate.
        </p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="surface-card rounded-xl shadow-xl border border-white/5 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-white/10 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-white/10 rounded w-full"></div>
            <div className="h-4 bg-white/10 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (user?.plan !== 'pro') {
    return (
      <div className="surface-card rounded-xl shadow-xl border border-white/5">
        <div className="px-6 py-4 border-b border-white/5 surface-elevated rounded-t-xl">
          <h3 className="text-lg font-bold text-white">Custom Domains</h3>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Use your own domain for email aliases
          </p>
        </div>
        <div className="p-6">
          <div className="text-center py-12">
            <Info className="w-16 h-16 text-white mx-auto mb-6" />
            <h4 className="text-xl font-bold text-white mb-2">Pro Feature</h4>
            <p className="text-[hsl(var(--muted-foreground))] mb-8 max-w-md mx-auto">
              Custom domains are available for Pro users. Upgrade to use your own domain for email aliases and build a more professional presence.
            </p>
            <button className="bg-white text-black px-6 py-3 rounded-lg hover:bg-white/90 font-bold transition-all cursor-pointer">
              Upgrade to Pro
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="surface-card rounded-xl shadow-xl border border-white/5">
      <div className="px-6 py-4 border-b border-white/5 surface-elevated rounded-t-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white">Custom Domains</h3>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              Manage your custom domains for creating email aliases
            </p>
          </div>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center justify-center gap-2 bg-white text-black px-4 py-2.5 rounded-lg hover:bg-white/90 transition-all font-bold cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Domain
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {showAddForm && (
          <div className="mb-8 p-5 border border-white/10 rounded-xl surface-elevated">
            <h4 className="text-md font-bold text-white mb-4">Add New Domain</h4>
            <form onSubmit={handleAddDomain} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                placeholder="example.com"
                className="flex-1 input-field"
                required
                disabled={submitting}
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting || !newDomain.trim()}
                  className="flex-1 sm:flex-none bg-white text-black px-6 py-3 rounded-lg hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold cursor-pointer"
                >
                  {submitting ? 'Adding...' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewDomain('');
                  }}
                  className="flex-1 sm:flex-none surface-interactive text-white px-6 py-3 rounded-lg hover:bg-white/10 transition-colors font-semibold border border-white/10 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {domains.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center surface-card border border-white/5 rounded-2xl p-10 max-w-sm w-full">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Plus className="text-white w-8 h-8" />
              </div>
              <p className="text-white font-semibold text-base mb-1">No custom domains</p>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Add your first domain to start using custom email aliases</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {domains.map((domain) => (
              <div key={domain._id} className="border border-white/10 rounded-xl p-5 surface-elevated shadow-lg">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                      {getStatusIcon(domain)}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-lg">{domain.domain}</h4>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${getStatusColor(domain)}`}>
                          {getStatusText(domain)}
                        </span>
                        {domain.createdAt && (
                          <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
                            Added {new Date(domain.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap md:flex-nowrap">
                    {!domain.isVerified && (
                      <span className="inline-flex items-center gap-2 bg-yellow-500/20 text-yellow-400 px-3 py-2 rounded-lg text-sm font-semibold">
                        <Clock className="w-4 h-4" />
                        Verifying...
                      </span>
                    )}
                    {domain.isVerified && domain.mailgunStatus !== 'active' && (
                      <button
                        onClick={() => handleCheckMailgunStatus(domain._id)}
                        disabled={verifying[`${domain._id}_mailgun`]}
                        className="inline-flex items-center justify-center gap-2 bg-orange-500/20 text-orange-400 border border-orange-500/30 px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                      >
                        {verifying[`${domain._id}_mailgun`] ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Checking...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-4 h-4" />
                            Check Status
                          </>
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteDomain(domain._id, domain.domain)}
                      className="inline-flex items-center justify-center gap-2 bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-500/20 hover:text-red-300 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>

                {!domain.isVerified && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-5 mb-4">
                    <h5 className="text-sm font-bold text-yellow-400 mb-2">
                      Domain Verification Required
                    </h5>
                    <p className="text-sm text-yellow-400/80 mb-4">
                      Please add the following TXT record to your DNS settings to verify ownership:
                    </p>
                    <div className="bg-background border border-white/5 rounded-lg p-4 font-mono text-sm shadow-inner">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-white/5">
                        <span className="font-semibold text-[hsl(var(--muted-foreground))] w-16">Type:</span>
                        <span className="text-white text-right font-bold">TXT</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3 pb-3 border-b border-white/5">
                        <span className="font-semibold text-[hsl(var(--muted-foreground))] w-16 flex-shrink-0 mt-0.5">Name:</span>
                        <div className="flex items-center gap-3 justify-end w-full">
                          <span className="break-all text-white/90">_mailalias-verification.{domain.domain}</span>
                          <button
                            onClick={() => copyToClipboard(`_mailalias-verification.${domain.domain}`, `${domain._id}_name`)}
                            className="text-[hsl(var(--muted-foreground))] hover:text-white transition-colors flex-shrink-0 cursor-pointer"
                          >
                            {copiedRecord === `${domain._id}_name` ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <span className="font-semibold text-[hsl(var(--muted-foreground))] w-16 flex-shrink-0 mt-0.5">Value:</span>
                        <div className="flex items-center gap-3 justify-end w-full">
                          <span className="break-all text-white/90">{domain.verificationToken}</span>
                          <button
                            onClick={() => copyToClipboard(domain.verificationToken, `${domain._id}_value`)}
                            className="text-[hsl(var(--muted-foreground))] hover:text-white transition-colors flex-shrink-0 cursor-pointer"
                          >
                            {copiedRecord === `${domain._id}_value` ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs font-medium text-yellow-500/70">
                      <p>DNS changes may take 5-60 minutes to propagate.</p>
                      {domain.lastVerificationAttempt && (
                        <p>Last checked: {new Date(domain.lastVerificationAttempt).toLocaleTimeString()}</p>
                      )}
                    </div>
                  </div>
                )}

                {domain.isVerified && domain.mailgunStatus !== 'active' && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-5 mt-4">
                    <h5 className="text-sm font-bold text-white mb-2">
                      Complete DNS Setup for Email Delivery
                    </h5>
                    <p className="text-sm text-white/80 mb-4 font-medium">
                      Your domain is verified! Now add these DNS records to enable email sending and receiving:
                    </p>
                    {renderDnsRecords(domain)}
                    <div className="mt-5 pt-4 border-t border-white/10">
                      <p className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
                        After adding these records, click "Check Status" button above to verify the configuration.
                      </p>
                    </div>
                  </div>
                )}

                {domain.isVerified && domain.mailgunStatus === 'active' && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-5 mt-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Check className="w-5 h-5 text-green-400" />
                      <h5 className="text-sm font-bold text-green-400">
                        Domain Active and Ready
                      </h5>
                    </div>
                    <p className="text-sm font-medium text-green-400/80 mb-4">
                      Your domain is fully configured and ready for creating email aliases.
                    </p>
                    {renderDnsRecords(domain)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}