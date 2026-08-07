'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function EmailList({ 
  emails = [], 
  loading = false, 
  onMarkAsRead, 
  onDelete, 
  onMarkAsSpam,
  selectedEmailId = null,
  onEmailSelect
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const router = useRouter();

  const filters = [
    { name: 'All', count: emails.length },
    { name: 'Read', count: emails.filter(e => e.isRead).length },
    { name: 'Unread', count: emails.filter(e => !e.isRead).length }
  ];

  const filteredEmails = emails.filter(email => {
    const matchesSearch = searchTerm === '' || 
      email.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.from?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.bodyPlain?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = activeFilter === 'All' ||
      (activeFilter === 'Read' && email.isRead) ||
      (activeFilter === 'Unread' && !email.isRead);
    
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diffDays <= 7) return date.toLocaleDateString([], { weekday: 'short' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getSenderInitial = (email) => {
    if (email.isSentEmail) {
      return (email.to?.charAt(0) || 'T')?.toUpperCase();
    }
    return (email.from?.charAt(0) || '?')?.toUpperCase();
  };

  const getSenderName = (email) => {
    if (email.isSentEmail) {
      return email.to || 'Unknown recipient';
    }
    return email.from || 'Unknown sender';
  };

  const getEmailPreview = (email) => {
    const preview = email.bodyPlain || 'No preview available';
    return preview.length > 100 ? preview.substring(0, 100) + '...' : preview;
  };

  if (loading) {
    return (
      <div className="flex-1 bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-[hsl(var(--muted-foreground))]">Loading emails...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-background flex flex-col border-r border-white/5">
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-white">Inbox</h1>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-[hsl(var(--muted-foreground))] hover:text-white hover:bg-white/5 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <Link
              href="/dashboard/send"
              className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center hover:bg-white/90 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </Link>
            <button className="p-2 text-[hsl(var(--muted-foreground))] hover:text-white hover:bg-white/5 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-[hsl(var(--muted-foreground))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-white/20 focus:border-white/20 text-white placeholder-[hsl(var(--muted-foreground))] text-sm transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex space-x-1">
          {filters.map((filter) => (
            <button
              key={filter.name}
              onClick={() => setActiveFilter(filter.name)}
              className={`px-3 py-1.5 text-sm font-bold rounded-md transition-colors ${
                activeFilter === filter.name
                  ? 'bg-white text-black'
                  : 'text-[hsl(var(--muted-foreground))] hover:text-white hover:bg-white/5'
              }`}
            >
              {filter.name}
            </button>
          ))}
        </div>
      </div>

      {/* Email List */}
      <div className="flex-1 overflow-y-auto">
        {filteredEmails.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-4xl mb-4">📪</div>
              <p className="text-[hsl(var(--muted-foreground))]">
                {searchTerm ? 'No emails match your search' : 'No emails found'}
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredEmails.map((email) => (
              <div
                key={email._id}
                onClick={() => onEmailSelect(email._id)}
                className={`p-4 hover:bg-white/5 cursor-pointer transition-all duration-200 group email-item-hover ${
                  selectedEmailId === email._id ? 'bg-white/5 border-l-2 border-white' : 'border-l-2 border-transparent'
                } ${!email.isRead ? 'bg-white/[0.02]' : ''}`}
              >
                <div className="flex items-start space-x-3">
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    email.isSpam 
                      ? 'bg-red-500/10 border border-red-500/20' 
                      : email.isSentEmail 
                        ? 'bg-green-500/10 border border-green-500/20' 
                        : 'bg-white/10 border border-white/20'
                  }`}>
                    <span className={`text-sm font-bold ${
                      email.isSpam 
                        ? 'text-red-400' 
                        : email.isSentEmail 
                          ? 'text-green-400' 
                          : 'text-white'
                    }`}>
                      {getSenderInitial(email)}
                    </span>
                  </div>

                  {/* Email Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <p className={`text-sm ${
                          !email.isRead ? 'text-white font-bold' : 'text-white/80 font-medium'
                        }`}>
                          {getSenderName(email)}
                        </p>
                        {!email.isRead && (
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        )}
                      </div>
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">
                        {formatDate(email.receivedAt)}
                      </span>
                    </div>

                    <p className={`text-sm mb-1 ${
                      !email.isRead ? 'font-bold text-white' : 'font-medium text-white/80'
                    }`}>
                      {email.subject || '(No Subject)'}
                    </p>

                    <p className="text-sm text-[hsl(var(--muted-foreground))] line-clamp-2">
                      {getEmailPreview(email)}
                    </p>

                    {/* Email Status Badges */}
                    <div className="flex items-center space-x-2 mt-2">
                      {email.isSentEmail && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                          Sent
                        </span>
                      )}
                      {email.isSpam && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                          Spam
                        </span>
                      )}
                      {email.attachments?.length > 0 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-white/10 text-white border border-white/20">
                          📎 {email.attachments.length}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkAsRead(email._id, !email.isRead);
                      }}
                      className="p-1.5 text-[hsl(var(--muted-foreground))] hover:text-white hover:bg-white/10 rounded-md transition-colors"
                      title={email.isRead ? 'Mark unread' : 'Mark read'}
                    >
                      {email.isRead ? '📭' : '📬'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/dashboard/send?reply=${email._id}`);
                      }}
                      className="p-1.5 text-[hsl(var(--muted-foreground))] hover:text-white hover:bg-white/10 rounded-md transition-colors"
                      title="Reply"
                    >
                      ↩️
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(email._id);
                      }}
                      className="p-1.5 text-[hsl(var(--muted-foreground))] hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
