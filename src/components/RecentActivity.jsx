// src/components/RecentActivity.jsx
'use client';

import Link from 'next/link';
import { Mail, Plus, Users, Eye, Activity, Send, Inbox } from 'lucide-react';

export default function RecentActivity({ activities, aliases }) {
  // Helper function to get activity text and icon
  const getActivityDetails = (act) => {
    switch (act.type) {
      case 'sent':
        return {
          text: `Email sent to ${act.data.to}`,
          subject: act.data.subject,
          icon: Mail,
          iconColor: 'text-blue-400',
          bgColor: 'bg-blue-500/20'
        };
      case 'added_collaborator':
        return {
          text: `Added ${act.data.addedUserEmail}`,
          subject: `as ${act.data.role}`,
          icon: Users,
          iconColor: 'text-green-400',
          bgColor: 'bg-green-500/20'
        };
      case 'removed_collaborator':
        return {
          text: `Removed ${act.data.removedUserEmail}`,
          subject: 'from collaboration',
          icon: Users,
          iconColor: 'text-red-400',
          bgColor: 'bg-red-500/20'
        };
      default:
        return {
          text: 'Activity logged',
          subject: '',
          icon: Eye,
          iconColor: 'text-gray-400',
          bgColor: 'bg-gray-500/20'
        };
    }
  };

  // Get last 3 created aliases
  const recentAliases = aliases 
    ? [...aliases]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3)
    : [];

  // Get recent activities (limit to 5)
  const recentActivities = activities 
    ? [...activities]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
    : [];

  return (
    <div className="surface-card rounded-xl border border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-white/[0.02] pointer-events-none" />
      <div className="relative z-10 px-5 py-4 border-b border-white/5">
        <h3 className="text-lg font-bold text-white">Recent Activity</h3>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Your latest aliases and activities</p>
      </div>
      
      <div className="relative z-10 divide-y divide-white/5">
        {/* Recently Created Aliases Section */}
        {recentAliases.length > 0 && (
          <div className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Plus className="w-4 h-4 text-white" />
              <h4 className="text-sm font-bold text-white">Recently Created Aliases</h4>
            </div>
            <div className="space-y-2">
              {recentAliases.map((alias) => (
                <div key={alias._id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-transparent hover:border-white/10">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                      alias.isCollaborative ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/10'
                    }`}>
                      <span className={`text-sm font-bold ${
                        alias.isCollaborative ? 'text-white' : 'text-white'
                      }`}>
                        {alias.aliasEmail.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-white truncate">
                        {alias.aliasEmail}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                          {new Date(alias.createdAt).toLocaleDateString()}
                        </p>
                        {alias.isCollaborative && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-white/10 text-white border border-white/20">
                            Team
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Link 
                      href={`/dashboard/inbox?alias=${alias.aliasEmail}`}
                      className="p-1.5 text-[hsl(var(--muted-foreground))] hover:text-white hover:bg-white/10 rounded-md transition-colors"
                      title="View Inbox"
                    >
                      <Inbox className="w-4 h-4" />
                    </Link>
                    <Link 
                      href={`/dashboard/send?alias=${alias.aliasEmail}`}
                      className="p-1.5 text-[hsl(var(--muted-foreground))] hover:text-white hover:bg-white/10 rounded-md transition-colors"
                      title="Send Email"
                    >
                      <Send className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activities Section */}
        <div className="p-5">
          <h4 className="text-sm font-bold text-white mb-3">Email Activities</h4>
          {recentActivities && recentActivities.length > 0 ? (
            <div className="space-y-3">
              {recentActivities.map((act) => {
                const details = getActivityDetails(act);
                const IconComponent = details.icon;
                
                return (
                  <div key={act._id} className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-white/10 flex-shrink-0`}>
                      <IconComponent className={`w-4 h-4 text-white`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-white font-bold truncate">
                        {details.text}
                      </p>
                      {details.subject && (
                        <p className="text-xs text-[hsl(var(--muted-foreground))] truncate mt-0.5">
                          {details.subject}
                        </p>
                      )}
                      <p className="text-xs text-[hsl(var(--muted-foreground))] opacity-75 mt-0.5">
                        {new Date(act.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6">
              <Activity className="w-8 h-8 text-[hsl(var(--muted-foreground))] mx-auto mb-2" />
              <p className="text-sm text-[hsl(var(--muted-foreground))]">No recent email activities.</p>
            </div>
          )}
        </div>

        <div className="px-5 py-4 bg-white/[0.02] border-t border-white/5 rounded-b-xl relative z-10">
          <div className="flex items-center justify-between text-sm">
            <Link 
              href="/dashboard/aliases" 
              className="text-white hover:text-white/70 font-bold transition-colors"
            >
              View all aliases →
            </Link>
            <Link 
              href="/dashboard/inbox" 
              className="text-white hover:text-white/70 font-bold transition-colors"
            >
              Go to inbox →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}