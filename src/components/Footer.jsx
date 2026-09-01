// src/components/Footer.jsx
'use client';

export default function Footer() {
  return (
    <footer
      className="mt-auto pt-6 border-t border-border text-sm text-muted-foreground animate-fade-in-up"
      style={{ animationDelay: '0.7s' }} // Keep existing animation style
    >
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <p>&copy; {new Date().getFullYear()} InvisiMail. All rights reserved.</p> {/* Updated name */}
        <div className="flex items-center gap-6">
          <a href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</a>
          <a href="/terms" className="hover:text-foreground transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}