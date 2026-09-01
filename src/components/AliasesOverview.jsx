'use client';

import Link from 'next/link';
import { Mail, Send, Trash2, UserPlus, Users, Activity, Inbox } from 'lucide-react';

export default function AliasesOverview({
  user,
  aliases,
  activities,
  isPro,
  toggleLoading,
  managingAliasId,
  addEmail,
  addRole,
  onToggleStatus,
  onDelete,
  onAddCollaborator,
  onRemoveCollaborator,
  setManagingAliasId,
  setAddEmail,
  setAddRole,
}) {

  const personalAliases = aliases.filter(a => !a.isCollaborative);
  const collaborativeAliases = aliases.filter(a => a.isCollaborative);

  const getActivityText = (act) => {
    switch (act.type) {
        case 'sent': return `Email sent to ${act.data.to}: ${act.data.subject}`;
        case 'added_collaborator': return `Added ${act.data.addedUserEmail} as ${act.data.role}`;
        case 'removed_collaborator': return `Removed ${act.data.removedUserEmail}`;
        default: return 'Activity logged';
    }
  };

  return (
    <div id="aliases-overview" className="surface-card rounded-xl border border-border shadow-xl">
      <div className="px-6 py-5 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">Your Email Aliases</h3>
          <span className="text-sm text-[hsl(var(--muted-foreground))]">
            {aliases.length} alias{aliases.length !== 1 ? 'es' : ''}
            {!isPro && <span className="text-amber-400 font-medium ml-2">({personalAliases.length}/5 personal)</span>}
          </span>
        </div>
      </div>
      
      <div className="divide-y divide-border">
        {aliases.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Mail className="w-16 h-16 mx-auto mb-4 text-[hsl(var(--muted-foreground))]" />
            <p className="text-foreground font-medium mb-2">No aliases created yet.</p>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Create your first alias to start receiving emails at custom addresses.
            </p>
          </div>
        ) : (
          <>
            {/* Personal Aliases */}
            {personalAliases.length > 0 && (
              <div className="p-4 md:p-6 space-y-4">
                <h4 className="text-sm font-semibold text-foreground px-2 flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-foreground" /> Personal Aliases
                </h4>
                {personalAliases.map((alias) => (
                  <div key={alias._id} className="surface-interactive p-4 md:p-5 rounded-xl border border-border">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                        {/* Alias Info */}
                        <div className="flex-1 min-w-0 w-full">
                            <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center border border-border">
                                        <span className="text-foreground font-semibold text-xl">
                                            {alias.aliasEmail.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-base font-bold text-foreground truncate">
                                        {alias.aliasEmail}
                                    </p>
                                    <p className="text-sm text-[hsl(var(--muted-foreground))] truncate">
                                        Forwards to: <span className="text-foreground/70">{alias.realEmail}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Status & Stats */}
                        <div className="flex items-center gap-5 text-sm">
                            <div className="flex flex-col items-center justify-center">
                                <span className="text-xs text-[hsl(var(--muted-foreground))] mb-1">Status</span>
                                <div className="flex items-center gap-1.5">
                                    <span className={`inline-block w-2.5 h-2.5 rounded-full ${alias.isActive !== false ? 'bg-green-400' : 'bg-red-400'}`}></span>
                                    <span className={`font-medium ${alias.isActive !== false ? 'text-green-400' : 'text-red-400'}`}>{alias.isActive !== false ? 'Active' : 'Inactive'}</span>
                                </div>
                            </div>
                            <div className="h-8 w-px bg-muted hidden sm:block"></div>
                            <div className="text-center">
                                <p className="font-bold text-foreground">{alias.emailsSent || 0}</p>
                                <p className="text-xs text-[hsl(var(--muted-foreground))]">Sent</p>
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-foreground">{alias.emailsReceived || 0}</p>
                                <p className="text-xs text-[hsl(var(--muted-foreground))]">Received</p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-2 pt-2 md:pt-0 w-full md:w-auto justify-end border-t border-border md:border-t-0 mt-4 md:mt-0">
                            <button
                                onClick={() => onToggleStatus(alias._id, alias.isActive !== false)}
                                disabled={toggleLoading[alias._id]}
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-ring/50 focus:ring-offset-2 focus:ring-offset-background ${alias.isActive !== false ? 'bg-primary' : 'bg-muted'} ${toggleLoading[alias._id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                                title={`Click to ${alias.isActive !== false ? 'deactivate' : 'activate'}`}
                            >
                                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full shadow ring-0 transition duration-200 ease-in-out ${alias.isActive !== false ? 'translate-x-5 bg-primary-foreground' : 'translate-x-0 bg-card'}`} />
                            </button>
                            <Link href={`/dashboard/inbox?alias=${alias.aliasEmail}`} className="p-2 text-[hsl(var(--muted-foreground))] hover:text-foreground hover:bg-muted rounded-lg transition-colors" title="View Inbox">
                                <Inbox className="w-5 h-5" />
                            </Link>
                            <Link href={`/dashboard/send?alias=${alias.aliasEmail}`} className="p-2 text-[hsl(var(--muted-foreground))] hover:text-foreground hover:bg-muted rounded-lg transition-colors" title="Send Email">
                                <Send className="w-5 h-5" />
                            </Link>
                            <button onClick={() => onDelete(alias._id)} className="p-2 text-[hsl(var(--muted-foreground))] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete Alias">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Collaborative Aliases */}
            {collaborativeAliases.length > 0 && (
              <div className="p-4 md:p-6 space-y-4">
                <h4 className="text-sm font-semibold text-foreground px-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-foreground" /> Collaborative Aliases
                </h4>
                {collaborativeAliases.map((alias) => {
                  const isOwner = alias.ownerId?.toString() === user?._id?.toString();
                  return (
                    <div key={alias._id} className="surface-interactive p-4 md:p-5 rounded-xl border border-border">
                       <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                            {/* Alias Info */}
                            <div className="flex-1 min-w-0 w-full">
                                <div className="flex items-center space-x-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center border border-border">
                                            <span className="text-foreground font-semibold text-xl">
                                                {alias.aliasEmail.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-base font-bold text-foreground truncate">
                                            {alias.aliasEmail}
                                        </p>
                                        <p className="text-sm text-[hsl(var(--muted-foreground))] truncate">
                                            Owner: <span className="text-foreground/70">{alias.owner?.[0]?.name || alias.owner?.[0]?.email || 'Unknown'}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Status & Stats */}
                            <div className="flex items-center gap-5 text-sm">
                                <div className="flex flex-col items-center justify-center">
                                    <span className="text-xs text-[hsl(var(--muted-foreground))] mb-1">Status</span>
                                    <div className="flex items-center gap-1.5">
                                        <span className={`inline-block w-2.5 h-2.5 rounded-full ${alias.isActive !== false ? 'bg-green-400' : 'bg-red-400'}`}></span>
                                        <span className={`font-medium ${alias.isActive !== false ? 'text-green-400' : 'text-red-400'}`}>{alias.isActive !== false ? 'Active' : 'Inactive'}</span>
                                    </div>
                                </div>
                                <div className="h-8 w-px bg-muted hidden sm:block"></div>
                                <div className="text-center">
                                    <p className="font-bold text-foreground">{alias.emailsSent || 0}</p>
                                    <p className="text-xs text-[hsl(var(--muted-foreground))]">Sent</p>
                                </div>
                                <div className="text-center">
                                    <p className="font-bold text-foreground">{alias.emailsReceived || 0}</p>
                                    <p className="text-xs text-[hsl(var(--muted-foreground))]">Received</p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center space-x-2 pt-2 md:pt-0 w-full md:w-auto justify-end border-t border-border md:border-t-0 mt-4 md:mt-0">
                                {isOwner && (
                                    <button
                                        onClick={() => onToggleStatus(alias._id, alias.isActive !== false)}
                                        disabled={toggleLoading[alias._id]}
                                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-ring/50 focus:ring-offset-2 focus:ring-offset-background ${alias.isActive !== false ? 'bg-primary' : 'bg-muted'} ${toggleLoading[alias._id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        title={`Click to ${alias.isActive !== false ? 'deactivate' : 'activate'}`}
                                    >
                                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full shadow ring-0 transition duration-200 ease-in-out ${alias.isActive !== false ? 'translate-x-5 bg-primary-foreground' : 'translate-x-0 bg-card'}`} />
                                    </button>
                                )}
                                <Link href={`/dashboard/inbox?alias=${alias.aliasEmail}`} className="p-2 text-[hsl(var(--muted-foreground))] hover:text-foreground hover:bg-muted rounded-lg transition-colors" title="View Inbox">
                                    <Inbox className="w-5 h-5" />
                                </Link>
                                <Link href={`/dashboard/send?alias=${alias.aliasEmail}`} className="p-2 text-[hsl(var(--muted-foreground))] hover:text-foreground hover:bg-muted rounded-lg transition-colors" title="Send Email">
                                    <Send className="w-5 h-5" />
                                </Link>
                                {isOwner && (
                                    <button onClick={() => onDelete(alias._id)} className="p-2 text-[hsl(var(--muted-foreground))] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete Alias">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Collaborators & Activity Section */}
                        <div className="mt-5 pt-5 border-t border-border md:pl-[64px]">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Collaborators List & Add Form */}
                                <div>
                                    <h4 className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
                                        <Users className="w-4 h-4 text-[hsl(var(--muted-foreground))]" /> Collaborators
                                    </h4>
                                    <div className="space-y-2">
                                        {alias.collaborators?.map((c) => (
                                            <div key={c.userId} className="flex items-center justify-between text-sm p-3 bg-muted border border-border rounded-lg">
                                                <span className="text-foreground/80">
                                                    {c.userDetails?.name || c.userDetails?.email || 'Unknown User'} <span className="text-[hsl(var(--muted-foreground))] ml-1">({c.role})</span>
                                                </span>
                                                {isOwner && (
                                                    <button onClick={() => onRemoveCollaborator(alias._id, c.userId)} className="text-red-400 hover:text-red-300 text-xs font-semibold px-2 py-1 rounded hover:bg-red-500/10 transition-colors">
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        {alias.collaborators?.length === 0 && (
                                            <p className="text-[hsl(var(--muted-foreground))] text-sm py-2">No collaborators yet.</p>
                                        )}
                                    </div>

                                    {isOwner && (
                                        <div className="mt-3">
                                            <div className="flex gap-2">
                                                <input
                                                    type="email"
                                                    placeholder="Add user by email"
                                                    value={managingAliasId === alias._id ? addEmail : ''}
                                                    onChange={(e) => { setManagingAliasId(alias._id); setAddEmail(e.target.value); }}
                                                    className="flex-1 input-field h-9 text-sm"
                                                />
                                                <button
                                                    onClick={() => onAddCollaborator(alias._id, addEmail, addRole)}
                                                    className="btn-primary h-9 px-4 py-0 text-sm whitespace-nowrap"
                                                    disabled={!addEmail || managingAliasId !== alias._id}
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Recent Activity */}
                                <div>
                                    <h4 className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
                                        <Activity className="w-4 h-4 text-[hsl(var(--muted-foreground))]" /> Recent Activity
                                    </h4>
                                    <div className="space-y-2 text-sm text-[hsl(var(--muted-foreground))]">
                                        {activities.filter(act => act.aliasId?.toString() === alias._id?.toString()).slice(0, 3).map((act) => (
                                            <div key={act._id} className="p-3 bg-muted border border-border rounded-lg flex flex-col gap-1">
                                                <p className="truncate text-foreground/80">{getActivityText(act)}</p>
                                                <span className="text-xs text-[hsl(var(--muted-foreground))]">{new Date(act.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        ))}
                                        {activities.filter(act => act.aliasId?.toString() === alias._id?.toString()).length === 0 && (
                                            <p className="text-[hsl(var(--muted-foreground))] text-sm py-2">No activity recorded.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}