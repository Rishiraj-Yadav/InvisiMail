// src/components/CreateAliasForm.jsx
'use client';

import { Plus, Info, Star, Globe } from 'lucide-react';

export default function CreateAliasForm({
  isPro,
  personalAliasesCount,
  canCreateMore,
  newAlias,
  isCollaborative,
  submitting = false,
  verifiedDomains = [],
  selectedDomain,
  setSelectedDomain,
  handleCreateAlias,
  setNewAlias,
  setIsCollaborative,
}) {
  const defaultDomain = process.env.NEXT_PUBLIC_MAILGUN_DOMAIN || 'yourdomain.com';

  return (
    <div className="surface-card rounded-2xl border border-gray-200 dark:border-white/5 shadow-xl">
      <div className="px-6 py-5 border-b border-gray-200 dark:border-white/5">
        <div className="mt-5 p-4 surface-interactive rounded-xl border border-gray-200 dark:border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-foreground" />
              <span className="text-sm font-semibold text-foreground">Current Plan Status</span>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
              isPro ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-gray-100 dark:bg-white/5 text-muted-foreground border-gray-200 dark:border-white/10'
            }`}>
              {isPro && <Star className="w-3.5 h-3.5 fill-current" />}
              {isPro ? 'Pro Plan' : 'Free Plan'}
            </div>
          </div>
          
          {!isPro && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-white/5">
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-muted-foreground">Personal aliases used:</span>
                <span className={`font-bold ${personalAliasesCount >= 5 ? 'text-red-400' : 'text-foreground'}`}>
                  {personalAliasesCount}/5
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-white/5 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    personalAliasesCount >= 5 ? 'bg-red-400' : 'bg-gray-800 dark:bg-white'
                  }`}
                  style={{ width: `${Math.min((personalAliasesCount / 5) * 100, 100)}%` }}
                ></div>
              </div>
              {personalAliasesCount >= 4 && (
                <p className="text-xs text-amber-400 mt-2 font-medium">
                  {personalAliasesCount >= 5 
                    ? 'Alias limit reached. Upgrade to Pro for unlimited aliases.'
                    : `Only ${5 - personalAliasesCount} alias${5 - personalAliasesCount !== 1 ? 'es' : ''} remaining.`
                  }
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        <form onSubmit={(e) => handleCreateAlias(e, selectedDomain)} className="space-y-6">
          <div>
            <label htmlFor="alias-input" className="block text-sm font-semibold text-foreground mb-2">
              Alias Name <span className="text-red-400">*</span>
            </label>
            <div className="flex items-center w-full h-12 bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 rounded-xl focus-within:border-[#6366F1] focus-within:ring-2 focus-within:ring-[#6366F1]/20 transition-all overflow-hidden">
              <input
                id="alias-input"
                type="text"
                placeholder="e.g., support, contact, info"
                className={`flex-1 h-full px-4 bg-transparent text-sm font-medium text-foreground placeholder:text-gray-400 dark:placeholder:text-white/40 focus:outline-none ${
                  !canCreateMore ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                value={newAlias}
                onChange={(e) => setNewAlias(e.target.value)}
                disabled={!canCreateMore || submitting}
                required
                pattern="[a-zA-Z0-9._-]+"
                title="Only letters, numbers, dots, hyphens and underscores allowed"
              />
              <span className="inline-flex items-center px-4 h-full text-muted-foreground bg-gray-100 dark:bg-white/5 border-l border-gray-200 dark:border-white/10 text-sm font-medium">
                @{selectedDomain || defaultDomain}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Use letters, numbers, dots (.), hyphens (-), and underscores (_) only. 2-50 characters.
            </p>
          </div>

          {/* Domain Selection (Pro only) */}
          {isPro && verifiedDomains.length > 0 && (
            <div>
              <label htmlFor="domain-select" className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4 text-foreground" />
                Select Domain
              </label>
              <select
                id="domain-select"
                className="block w-full input-field cursor-pointer"
                value={selectedDomain || defaultDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                disabled={submitting}
              >
                <option value={defaultDomain}>{defaultDomain} (Default)</option>
                {verifiedDomains.map((dom) => (
                  <option key={dom._id} value={dom.domain}>
                    {dom.domain} (Custom)
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-2">
                Choose a verified custom domain or use the default.
              </p>
            </div>
          )}

          {isPro && (
            <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="collaborative-checkbox"
                    type="checkbox"
                    checked={isCollaborative}
                    onChange={(e) => setIsCollaborative(e.target.checked)}
                    disabled={submitting}
                    className="w-4 h-4 rounded border-gray-300 dark:border-white/20 bg-background accent-indigo-500 cursor-pointer"
                  />
                </div>
                <div className="ml-3">
                  <label htmlFor="collaborative-checkbox" className="text-sm font-bold text-indigo-400 flex items-center gap-2 cursor-pointer">
                    <Star className="w-4 h-4" />
                    Make this a collaborative alias
                  </label>
                  <p className="text-xs text-indigo-400/70 mt-1">
                    Allow team members to send and receive emails from this alias. You can add collaborators after creation.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Create Button */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-white/5">
            <div>
              {!canCreateMore && (
                <p className="text-sm text-red-400 font-bold">
                  Upgrade to Pro to create more aliases
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={!canCreateMore || !newAlias.trim() || submitting}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                canCreateMore && newAlias.trim() && !submitting
                  ? 'bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white hover:from-[#4F46E5] hover:to-[#7C3AED] shadow-lg shadow-indigo-500/25 cursor-pointer'
                  : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-white/30 border border-gray-200 dark:border-white/10 cursor-not-allowed'
              }`}
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-500 border-t-transparent"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  {canCreateMore ? 'Create Alias' : 'Upgrade Required'}
                </>
              )}
            </button>
          </div>
        </form>

        {/* Pro Features Preview for Free Users */}
        {!isPro && (
          <div className="mt-8 p-5 border border-gray-200 dark:border-white/10 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Star className="w-24 h-24 text-foreground" />
            </div>
            <div className="flex items-start gap-4 relative z-10">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Star className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">Unlock Pro Features</h4>
                <ul className="text-xs text-muted-foreground mt-2 space-y-1.5">
                  <li className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-gray-800 dark:bg-white"></span> Unlimited email aliases</li>
                  <li className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-gray-800 dark:bg-white"></span> Collaborative team aliases</li>
                  <li className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-gray-800 dark:bg-white"></span> Custom domains</li>
                  <li className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-gray-800 dark:bg-white"></span> Advanced analytics</li>
                  <li className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-gray-800 dark:bg-white"></span> Priority support</li>
                </ul>
                <p className="text-xs text-foreground font-bold mt-3">
                  Starting at ₹499/month
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}