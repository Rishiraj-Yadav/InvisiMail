'use client';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Inbox, Send, AlertOctagon, Trash2, Reply, MoreVertical, RefreshCw, LogOut, ChevronLeft, ChevronRight, User } from 'lucide-react';
import AssistantChat from '@/components/AssistantChatPhase2';
import ThemeToggle from '@/components/ThemeToggle';

// ─── SIDEBAR (Inbox-specific, dark themed) ───
function InboxSidebar({ user, counts, mailType, setMailType, onLogout, isExpanded, setIsExpanded }) {
    return (
        <aside
            className={`surface-card border-r-0 rounded-none flex-col h-screen hidden lg:flex transition-all duration-300 ease-in-out ${
                isExpanded ? 'w-64' : 'w-20'
            } relative group`}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
        >
            <div className="p-3 border-b border-border">
                <ThemeToggle compact={false} />
            </div>

            {/* User Profile */}
            <div className="p-4 border-b border-border">
                <div className="flex items-center justify-center mb-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center text-xl font-bold text-primary">
                        {user?.name ? user.name.charAt(0).toUpperCase() : <User size={24} />}
                    </div>
                </div>
                {isExpanded && (
                    <div className="text-center overflow-hidden">
                        <h3 className="font-semibold text-foreground text-sm truncate">{user?.name || 'User'}</h3>
                        <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">{user?.email}</p>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 overflow-y-auto">
                <ul className="space-y-1">
                    <li>
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[hsl(var(--muted-foreground))] hover:bg-muted hover:text-foreground transition-all cursor-pointer"
                            title="Back to Dashboard"
                        >
                            <ChevronLeft size={20} className="flex-shrink-0" />
                            {isExpanded && <span className="text-sm font-medium">Dashboard</span>}
                        </Link>
                    </li>

                    <li className="py-2"><hr className="border-border" /></li>

                    {[
                        { name: 'All', type: 'all', icon: Mail, count: counts.all || 0 },
                        { name: 'Received', type: 'received', icon: Inbox, count: counts.received || 0 },
                        { name: 'Sent', type: 'sent', icon: Send, count: counts.sent || 0 },
                        { name: 'Spam', type: 'spam', icon: AlertOctagon, count: counts.spam || 0 },
                    ].map((item) => {
                        const IconComponent = item.icon;
                        const isActive = mailType === item.type;

                        return (
                            <li key={item.name}>
                                <button
                                    onClick={() => setMailType(item.type)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                                        isActive
                                            ? 'bg-primary/12 text-foreground'
                                            : 'text-[hsl(var(--muted-foreground))] hover:bg-muted hover:text-foreground'
                                    }`}
                                    title={item.name}
                                >
                                    <IconComponent size={20} className={`flex-shrink-0 ${isActive ? 'text-primary' : ''}`} />
                                    {isExpanded && (
                                        <>
                                            <span className="flex-1 text-left">{item.name}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                isActive ? 'bg-primary/20 text-primary' : 'bg-muted text-[hsl(var(--muted-foreground))]'
                                            }`}>
                                                {item.count}
                                            </span>
                                        </>
                                    )}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Logout */}
            <div className="p-3 border-t border-border">
                <button
                    onClick={onLogout}
                    className="w-full flex items-center justify-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                    title="Logout"
                >
                    <LogOut size={20} className="flex-shrink-0" />
                    {isExpanded && <span>Logout</span>}
                </button>
            </div>

            {/* Expand/Collapse Toggle */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-[hsl(var(--card))] border border-border rounded-full flex items-center justify-center text-[hsl(var(--muted-foreground))] hover:text-foreground hover:border-border transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
            >
                {isExpanded ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </button>
        </aside>
    );
}

// ─── EMAIL DETAIL VIEW ───
function EmailDetailView({ emailId, onUpdate, user }) {
    const [email, setEmail] = useState(null);
    const [alias, setAlias] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchEmailData = useCallback(async () => {
        if (!emailId) return;
        setLoading(true);
        setError('');
        try {
            const emailRes = await fetch(`/api/inbox/${emailId}`);
            if (!emailRes.ok) throw new Error(`Failed to fetch email (${emailRes.status})`);
            const emailData = await emailRes.json();
            setEmail(emailData);

            if (emailData.aliasEmail) {
                const aliasRes = await fetch('/api/aliases');
                if (aliasRes.ok) {
                    const aliases = await aliasRes.json();
                    setAlias(aliases.find(a => a.aliasEmail === emailData.aliasEmail));
                }
            }

            if (!emailData.isRead) {
                await fetch(`/api/inbox/${emailId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ isRead: true }),
                });
            }
        } catch (err) {
            console.error('Error fetching email details:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [emailId]);

    useEffect(() => { fetchEmailData(); }, [fetchEmailData]);

    const deleteEmail = async () => {
        if (!confirm('Are you sure you want to permanently delete this email?')) return;
        try {
            const response = await fetch(`/api/inbox/${emailId}`, { method: 'DELETE' });
            if (response.ok) onUpdate();
            else alert('Failed to delete email.');
        } catch (err) { alert('A network error occurred.'); }
    };

    const toggleSpamStatus = async (isSpam) => {
        try {
            const response = await fetch(`/api/inbox/${emailId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isSpam }),
            });
            if (response.ok) onUpdate();
            else alert('Failed to update spam status.');
        } catch (err) { alert('A network error occurred.'); }
    };

    const formatFullDate = (dateString) => new Date(dateString).toLocaleString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const canUserReply = () => {
        if (!email || !user || !alias || email.isSentEmail || email.isSpam) return false;
        if (!alias.isCollaborative) return alias.ownerId?.toString() === user._id?.toString();
        if (alias.ownerId?.toString() === user._id?.toString()) return true;
        const collaborator = alias.collaborators?.find(c => c.userId?.toString() === user._id?.toString());
        return collaborator?.role === 'member';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full bg-background">
                <div className="text-center">
                    <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Loading email...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center">
                <div className="text-red-400 mb-4 text-sm">Error: {error}</div>
                <button onClick={fetchEmailData} className="text-primary hover:text-foreground text-sm cursor-pointer">Try Again</button>
            </div>
        );
    }

    if (!email) return null;

    const displayInfo = {
        isSpam: email.isSpam || false,
        isSentEmail: email.isSentEmail || false,
        displayFrom: email.isSentEmail ? email.aliasEmail : email.from,
    };

    return (
        <div className="bg-background h-full flex flex-col overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-border surface-elevated rounded-none flex-shrink-0">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-bold text-foreground mb-2">{email.subject || '(No Subject)'}</h2>
                        <div className="flex items-center gap-4 text-sm text-[hsl(var(--muted-foreground))]">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center text-primary text-xs font-semibold">
                                    {displayInfo.displayFrom.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-medium text-foreground">{displayInfo.displayFrom}</span>
                            </div>
                            <span className="text-foreground/20">·</span>
                            <span>{formatFullDate(email.receivedAt)}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        {canUserReply() && (
                            <Link href={`/dashboard/send?reply=${emailId}`} className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors cursor-pointer" title="Reply">
                                <Reply size={18} />
                            </Link>
                        )}
                        {displayInfo.isSpam ? (
                            <button onClick={() => toggleSpamStatus(false)} className="p-2 rounded-lg hover:bg-green-500/10 text-green-400 transition-colors cursor-pointer" title="Not Spam">
                                <AlertOctagon size={18} />
                            </button>
                        ) : (
                            <button onClick={() => toggleSpamStatus(true)} className="p-2 rounded-lg hover:bg-orange-500/10 text-orange-400 transition-colors cursor-pointer" title="Mark as Spam">
                                <AlertOctagon size={18} />
                            </button>
                        )}
                        <button onClick={deleteEmail} className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors cursor-pointer" title="Delete">
                            <Trash2 size={18} />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-muted text-[hsl(var(--muted-foreground))] transition-colors cursor-pointer">
                            <MoreVertical size={18} />
                        </button>
                    </div>
                </div>

                <div className="flex gap-2">
                    {!email.isRead && <span className="badge text-xs">Unread</span>}
                    {displayInfo.isSpam && (
                        <span className="px-3 py-1 bg-red-500/12 text-red-400 text-xs font-semibold rounded-full border border-red-500/20">
                            Spam
                        </span>
                    )}
                </div>
            </div>

            {/* Email Body */}
            <div className="flex-1 p-6 overflow-y-auto">
                {displayInfo.isSpam && (
                    <div className="mb-6 p-4 alert-error rounded-xl border-l-4 border-l-red-500">
                        <div className="flex items-start gap-3">
                            <AlertOctagon className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
                            <div>
                                <h3 className="font-semibold text-red-300">Spam Warning</h3>
                                <p className="text-sm text-red-400 mt-1">This email was identified as spam. Be cautious with links and attachments.</p>
                            </div>
                        </div>
                    </div>
                )}

                {email.bodyHtml ? (
                    <div
                        className="prose max-w-none leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: email.bodyHtml }}
                    />
                ) : (
                    <div className="whitespace-pre-wrap leading-relaxed font-mono text-sm surface-card p-4 rounded-xl text-[hsl(var(--foreground))]">
                        {email.bodyPlain || 'No content.'}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── EMAIL LIST ITEM ───
function EmailListItem({ email, isSelected, onClick, formatDate }) {
    const isUnread = !email.isRead;

    return (
        <button
            onClick={onClick}
            className={`w-full text-left p-4 border-b border-border transition-all cursor-pointer ${
                isSelected
                    ? 'bg-primary/8 border-l-2 border-l-primary'
                    : email.isSpam
                    ? 'bg-red-500/5 hover:bg-red-500/8 border-l-2 border-l-red-500/40'
                    : isUnread
                    ? 'bg-card/50 hover:bg-card/70 border-l-2 border-l-primary/50'
                    : 'hover:bg-muted/70 border-l-2 border-l-transparent'
            }`}
        >
            <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
                    email.isSpam
                        ? 'bg-red-500/15 text-red-400'
                        : 'bg-primary/15 text-primary'
                }`}>
                    {(email.isSentEmail ? (email.to || 'T') : (email.from || 'F')).charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                        <p className={`truncate text-sm ${isUnread ? 'font-bold text-foreground' : 'font-medium text-[hsl(var(--foreground))]'}`}>
                            {email.isSentEmail ? `To: ${email.to}` : email.from}
                        </p>
                        <span className="text-xs text-[hsl(var(--muted-foreground))] ml-2 flex-shrink-0">{formatDate(email.receivedAt)}</span>
                    </div>

                    <p className={`truncate text-sm mb-1 ${isUnread ? 'text-foreground font-semibold' : 'text-[hsl(var(--muted-foreground))]'}`}>
                        {email.subject || '(No Subject)'}
                    </p>

                    <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">
                        {email.bodyPlain?.substring(0, 80) || '...'}
                    </p>

                    <div className="flex gap-2 mt-2">
                        {email.isSpam && (
                            <span className="px-2 py-0.5 bg-red-500/12 text-red-400 text-xs font-medium rounded border border-red-500/20">Spam</span>
                        )}
                        {isUnread && (
                            <span className="badge text-[10px] py-0 px-1.5">New</span>
                        )}
                    </div>
                </div>
            </div>
        </button>
    );
}

// ─── EMAIL LIST PANE ───
function EmailListPane({ emails, loading, selectedEmailId, onSelectEmail, mailType, aliases, selectedAlias, setSelectedAlias, unreadOnly, setUnreadOnly, onRefresh, formatDate }) {
    return (
        <div className="bg-transparent flex flex-col h-full border-r border-border relative z-10">
            {/* Header */}
            <header className="relative p-4 border-b border-border bg-card/50 backdrop-blur-md flex-shrink-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-30 pointer-events-none" />
                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-3">
                        <h1 className="text-xl font-bold text-foreground capitalize tracking-tight">{mailType} Emails</h1>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onRefresh}
                            className="p-2 rounded-lg hover:bg-muted text-[hsl(var(--muted-foreground))] hover:text-foreground transition-colors cursor-pointer"
                            title="Refresh"
                        >
                            <RefreshCw size={18} />
                        </button>
                        <Link
                            href="/dashboard/send"
                            className="btn-primary text-sm px-4 py-2 h-auto flex items-center gap-2"
                        >
                            <Send size={16} />
                            Compose
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3">
                    <select
                        value={selectedAlias}
                        onChange={(e) => setSelectedAlias(e.target.value)}
                        className="flex-1 input-field h-10 text-sm cursor-pointer"
                    >
                        <option value="">All Aliases</option>
                        {aliases.map((alias) => (
                            <option key={alias._id} value={alias.aliasEmail}>{alias.aliasEmail}</option>
                        ))}
                    </select>

                    <label className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg hover:bg-muted transition-colors">
                        <input
                            type="checkbox"
                            checked={unreadOnly}
                            onChange={(e) => setUnreadOnly(e.target.checked)}
                            className="w-4 h-4 rounded accent-primary cursor-pointer"
                        />
                        <span className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Unread</span>
                    </label>
                    </div>
                </div>
            </header>

            {/* Email List */}
            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">Loading emails...</p>
                    </div>
                </div>
            ) : emails.length > 0 ? (
                <div className="flex-1 overflow-y-auto">
                    {emails.map(email => (
                        <EmailListItem
                            key={email._id}
                            email={email}
                            isSelected={selectedEmailId === email._id}
                            onClick={() => onSelectEmail(email._id)}
                            formatDate={formatDate}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center p-6">
                    <div className="text-center surface-card border border-border rounded-2xl p-10 max-w-sm w-full">
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Mail className="text-primary" size={32} />
                        </div>
                        <p className="text-foreground font-semibold text-base mb-1">No emails here</p>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">Your inbox is empty</p>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── MAIN INBOX COMPONENT ───
function InboxMainComponent() {
    const [emails, setEmails] = useState([]);
    const [user, setUser] = useState(null);
    const [aliases, setAliases] = useState([]);
    const [counts, setCounts] = useState({});
    const [loadingList, setLoadingList] = useState(true);
    const [selectedEmailId, setSelectedEmailId] = useState(null);
    const [mailType, setMailType] = useState('all');
    const [selectedAlias, setSelectedAlias] = useState('');
    const [unreadOnly, setUnreadOnly] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);

    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const emailIdFromUrl = searchParams.get('id');
        const typeFromUrl = searchParams.get('type');
        setSelectedEmailId(emailIdFromUrl);
        if (typeFromUrl) setMailType(typeFromUrl);
    }, [searchParams]);

    const fetchListData = useCallback(async () => {
        setLoadingList(true);
        try {
            const userResPromise = fetch('/api/user');
            const aliasesResPromise = fetch('/api/aliases');

            const params = new URLSearchParams({ type: mailType, limit: '100' });
            if (selectedAlias) params.append('alias', selectedAlias);
            if (unreadOnly) params.append('unread', 'true');

            const emailsRes = await fetch(`/api/inbox?${params}`);
            if (!emailsRes.ok) throw new Error('Failed to fetch emails');
            const emailData = await emailsRes.json();
            setEmails(emailData.emails || []);
            setCounts(emailData.counts || {});

            const userRes = await userResPromise;
            if (userRes.ok) setUser(await userRes.json());

            const aliasesRes = await aliasesResPromise;
            if (aliasesRes.ok) setAliases(await aliasesRes.json() || []);
        } catch (error) {
            console.error('Error fetching inbox list:', error);
        } finally {
            setLoadingList(false);
        }
    }, [mailType, selectedAlias, unreadOnly]);

    useEffect(() => { fetchListData(); }, [fetchListData]);

    const handleSelectEmail = (emailId) => {
        router.push(`/dashboard/inbox?type=${mailType}&id=${emailId}`, { scroll: false });
    };

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/');
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.ceil((now - date) / (1000 * 60 * 60 * 24));
        if (diffDays <= 1) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (diffDays <= 7) return date.toLocaleDateString([], { weekday: 'short' });
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden relative">
            {/* Ambient Gradients */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-[20%] w-[400px] h-[400px] bg-violet-500/10 rounded-full blur-[120px] pointer-events-none" />

            <InboxSidebar
                user={user}
                counts={counts}
                mailType={mailType}
                setMailType={setMailType}
                onLogout={handleLogout}
                isExpanded={isExpanded}
                setIsExpanded={setIsExpanded}
            />

            <div className="flex-1 flex overflow-hidden">
                {selectedEmailId ? (
                    <>
                        <div className="w-96 flex-shrink-0 hidden md:block">
                            <EmailListPane
                                emails={emails} loading={loadingList}
                                selectedEmailId={selectedEmailId} onSelectEmail={handleSelectEmail}
                                mailType={mailType} aliases={aliases}
                                selectedAlias={selectedAlias} setSelectedAlias={setSelectedAlias}
                                unreadOnly={unreadOnly} setUnreadOnly={setUnreadOnly}
                                onRefresh={fetchListData} formatDate={formatDate}
                            />
                        </div>
                        <div className="flex-1">
                            <EmailDetailView
                                key={selectedEmailId}
                                emailId={selectedEmailId}
                                user={user}
                                onUpdate={() => {
                                    router.push(`/dashboard/inbox?type=${mailType}`, { scroll: false });
                                    fetchListData();
                                }}
                            />
                        </div>
                    </>
                ) : (
                    <EmailListPane
                        emails={emails} loading={loadingList}
                        selectedEmailId={selectedEmailId} onSelectEmail={handleSelectEmail}
                        mailType={mailType} aliases={aliases}
                        selectedAlias={selectedAlias} setSelectedAlias={setSelectedAlias}
                        unreadOnly={unreadOnly} setUnreadOnly={setUnreadOnly}
                        onRefresh={fetchListData} formatDate={formatDate}
                    />
                )}
            </div>

            <AssistantChat />
        </div>
    );
}

// Page Wrapper
export default function UnifiedInboxPage() {
    return (
        <Suspense fallback={
            <div className="h-screen w-screen bg-background flex items-center justify-center">
                <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        }>
            <InboxMainComponent />
        </Suspense>
    );
}