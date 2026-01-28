'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const LANGUAGES = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'hi', label: 'हिन्दी', short: 'HI' },
  { code: 'es', label: 'Español', short: 'ES' },
  { code: 'fr', label: 'Français', short: 'FR' },
];

export default function LandingPage() {
  const [showAuthDropdown, setShowAuthDropdown] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');

  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://unpkg.com/@splinetool/viewer@1.12.5/build/spline-viewer.js';
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showAuthDropdown && !(e.target)?.closest('.auth-dropdown')) {
        setShowAuthDropdown(false);
      }
      if (showLangDropdown && !(e.target)?.closest('.lang-dropdown')) {
        setShowLangDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAuthDropdown, showLangDropdown]);

  return (
    <div className="landing-page">
      <div className="bg-gradient" />

      <header className="landing-header">
        <div className="logo-container">
          <Image
            src="/image.png"
            alt="InvisiMail Logo"
            className="logo-img"
            width={64}
            height={64}
            priority
          />
          <h1 className="logo">InvisiMail</h1>
        </div>

        <nav className="landing-nav">
          <a href="#features">Features</a>
          <a href="#trust">Trust</a>
          <a href="#faq">FAQ</a>

          <div className="lang-dropdown">
            <button
              className="lang-btn"
              onClick={() => setShowLangDropdown(!showLangDropdown)}
              type="button"
            >
              🌐 {LANGUAGES.find(l => l.code === currentLang)?.short}
            </button>

            {showLangDropdown && (
              <div className="lang-menu">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    className={`lang-item ${currentLang === lang.code ? 'active' : ''}`}
                    onClick={() => {
                      setCurrentLang(lang.code);
                      setShowLangDropdown(false);
                      document.cookie = `lingo-locale=${lang.code}; path=/; max-age=31536000`;
                      window.location.reload();
                    }}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="auth-dropdown">
            <button
              className="btn-signing"
              onClick={() => setShowAuthDropdown(!showAuthDropdown)}
              type="button"
            >
              Login / Signup
            </button>

            {showAuthDropdown && (
              <div className="auth-dropdown-menu">
                <Link href="/signin" className="auth-dropdown-item">
                  Sign In
                </Link>
                <Link href="/register" className="auth-dropdown-item">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </nav>
      </header>

      <main className="landing-main">
        <div className="landing-content">
          <div className="tag-box">
            <div className="tag">Protect Your Inbox</div>
          </div>

          <h1>
            Private Email <br />
            for Developers & Creators
          </h1>

          <p className="landing-description">
            Create disposable email aliases. Protect your real inbox. Block spam. Stay anonymous.
          </p>

          <div className="landing-button">
            <button
              className="btn-signing-main"
              onClick={() => setShowAuthDropdown(true)}
            >
              Get Started →
            </button>
          </div>
        </div>

        <spline-viewer
          className="robot-3d"
          url="https://prod.spline.design/rdUxwCyuG9PozTJH/scene.splinecode"
        />
      </main>

      {/* rest of sections — features, trust, faq, cta, footer */}
      <section id="features" className="section">
        <h2 className="section-title">Why InvisiMail?</h2>
        <div className="features-grid">
          <div className="feature-box">
            <h3>🛡️ Privacy First</h3>
            <p>Hide your real email behind disposable aliases — never exposed to trackers or spam.</p>
          </div>
          <div className="feature-box">
            <h3>⚡ Instant Aliases</h3>
            <p>Create new emails in seconds — from dashboard or via simple API calls.</p>
          </div>
          <div className="feature-box">
            <h3>📬 Clean Inbox</h3>
            <p>Smart forwarding, auto-filters, block rules — only important messages reach you.</p>
          </div>
        </div>
      </section>

      <section id="trust" className="section">
        <h2 className="section-title">Trusted by Developers</h2>
        <div className="trust-grid">
          <div className="trust-box">
            <p>“I finally sign up for services without destroying my real inbox.”</p>
            <span>— Alex, Indie Hacker</span>
          </div>
          <div className="trust-box">
            <p>“Clean API, fast forwarding, zero hassle. Perfect for automation.”</p>
            <span>— Priya, Backend Engineer</span>
          </div>
          <div className="trust-box">
            <p>“Simple, fast, secure. Exactly what I needed for side projects.”</p>
            <span>— Mark, Freelancer</span>
          </div>
        </div>
      </section>

      <section id="faq" className="section">
        <h2 className="section-title">Frequently Asked Questions</h2>
        <div className="faq-grid">
          <div className="faq-box">
            <h3>Is there a free plan?</h3>
            <p>Yes — solid free tier with core features. Paid plans give more aliases & filters.</p>
          </div>
          <div className="faq-box">
            <h3>How secure is it?</h3>
            <p>Encrypted forwarding. No content logging. True alias anonymity.</p>
          </div>
          <div className="faq-box">
            <h3>Do I need to install anything?</h3>
            <p>No installs — works entirely in browser or via API.</p>
          </div>
        </div>
      </section>

      <section className="section cta">
        <h2 className="section-title">Take control of your inbox today</h2>
        <button
          className="btn-signing-main"
          onClick={() => setShowAuthDropdown(true)}
        >
          Create Free Alias →
        </button>
      </section>

      <footer className="landing-footer">
        <p>© 2025–2026 InvisiMail. All rights reserved.</p>
        <div className="footer-links">
          <a href="#">Privacy Policy</a> • <a href="#">Terms</a> • <a href="#">Contact</a>
        </div>
      </footer>
    </div>
  );
}