// src/app/dashboard/send/page.jsx
import { Suspense } from 'react';
import SendEmail from './sendEmail';

export default function SendEmailPage() {
  return (
    <Suspense fallback={<Loading />}>
      <SendEmail />
    </Suspense>
  );
}

function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Loading...</p>
      </div>
    </div>
  );
}