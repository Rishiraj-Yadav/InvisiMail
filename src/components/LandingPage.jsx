'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Mail, Shield, Zap, Inbox, Layers, LayoutDashboard, Globe, Check, ChevronDown, Lock, Activity, Sparkles, MessageSquare, ArrowRight, X, Star, Server, Key, EyeOff } from 'lucide-react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import TextRotator from './TextRotator';

const SplineScene = dynamic(() => import('./3d/SplineScene'), { 
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-transparent z-10">
      <div className="w-12 h-12 rounded-full border-4 border-t-purple-500 border-purple-500/20 animate-spin" />
    </div>
  )
});

const FAQS = [
  { q: 'Is there a free tier?', a: 'Yes, our Free tier includes up to 10 active aliases and standard forwarding. It’s perfect for trying out InvisiMail without any commitment.' },
  { q: 'Do you keep logs of my emails?', a: 'Absolutely not. We operate on a strict zero-knowledge architecture. Emails are encrypted in transit, forwarded instantly, and immediately deleted from our servers.' },
  { q: 'Can I use my own custom domain?', a: 'Yes, Pro users can connect unlimited custom domains (e.g., hello@yourdomain.com) for a more professional and personalized aliasing experience.' },
  { q: 'Is there a browser extension?', a: 'We currently offer extensions for Chrome, Firefox, and Safari, allowing you to generate aliases directly from any signup form with one click.' },
  { q: 'What happens if I reply to an email?', a: 'When you reply to a forwarded email, it is routed back through our servers and sent from your alias. Your real email address remains completely hidden from the recipient.' },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState(null);
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Interactive Demo State
  const [demoInput, setDemoInput] = useState('');
  const [demoAlias, setDemoAlias] = useState('');
  const [demoStatus, setDemoStatus] = useState('idle'); // idle, generating, done

  const handleDemoGenerate = (e) => {
    e.preventDefault();
    if(!demoInput) return;
    setDemoStatus('generating');
    setTimeout(() => {
      const randomHex = Math.random().toString(16).substring(2, 7);
      const domain = demoInput.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'site';
      setDemoAlias(`${domain}.${randomHex}@invisimail.com`);
      setDemoStatus('done');
    }, 800);
  };

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  // Common animation variants
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] font-sans selection:bg-[#6366F1]/50 selection:text-white relative">
      
      {/* No Ambient Gradients for a cleaner look */}
      
      {/* 1. Navbar */}
      <motion.header 
        variants={{
          visible: { y: 0, opacity: 1 },
          hidden: { y: -100, opacity: 0 }
        }}
        initial="hidden"
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className="fixed top-4 inset-x-2 md:inset-x-4 max-w-5xl mx-auto z-50 border border-white/5 bg-[#09090B]/60 backdrop-blur-xl rounded-full"
      >
        <div className="px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 4L6 8V15C6 21 10.5 26.5 16 28C21.5 26.5 26 21 26 15V8L16 4Z" stroke="url(#logo_grad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 11.5L16 16.5L23 11.5" stroke="url(#logo_grad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <defs>
                    <linearGradient id="logo_grad" x1="6" y1="4" x2="26" y2="28" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#818CF8" />
                      <stop offset="1" stopColor="#C084FC" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <span className="text-xl font-semibold tracking-tight text-white">InvisiMail</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-8">
              {['Features', 'How It Works', 'FAQ'].map((item) => (
                <Link key={item} href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} className="text-sm font-medium text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors">
                  {item}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/signin" className="hidden sm:block text-sm font-medium text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors px-4 py-2">
              Log In
            </Link>
            <Link href="/register" className="bg-[#FAFAFA] text-[#09090B] px-6 py-2.5 rounded-full text-sm font-semibold hover:scale-102 transition-transform active:scale-95">
              Get Started
            </Link>
          </div>
        </div>
      </motion.header>

      {/* 2. Hero Section */}
      <main 
        onMouseMove={handleMouseMove}
        className="relative min-h-[100svh] flex items-center pt-20 overflow-hidden"
      >
        <div className="absolute inset-0 z-0 bg-[#09090B]" />
        
        {/* Spotlight Effect */}
        <div 
          className="pointer-events-none absolute inset-0 z-0 opacity-50 transition-opacity duration-300"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(99,102,241,0.12), transparent 40%)`
          }}
        />
        
        {/* Right Side: 3D Model */}
        <div className="absolute z-10 top-1/2 right-[-10%] md:right-0 -translate-y-1/2 w-[150%] md:w-[60%] h-[120%] opacity-80 pointer-events-none">
          <SplineScene
            scene="https://prod.spline.design/rdUxwCyuG9PozTJH/scene.splinecode"
            className="w-full h-full"
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 w-full relative z-20 flex flex-col lg:flex-row items-center pointer-events-none mt-20 lg:mt-0 gap-12">
          {/* Text Content */}
          <div className="w-full lg:w-[50%] flex flex-col items-start text-left mt-12 lg:mt-0">
            
            <motion.div 
              initial="hidden" animate="visible" variants={fadeUp}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8"
            >
              <span className="text-xs font-medium text-[#A1A1AA]">Privacy-First Email Aliasing</span>
            </motion.div>

            <motion.h1 
              initial="hidden" animate="visible" variants={fadeUp}
              className="text-6xl lg:text-7xl font-semibold leading-[1.1] tracking-tighter mb-8 text-white"
            >
              One inbox.<br/>
              <TextRotator 
                words={['Absolute privacy.', 'Total control.', 'Zero spam.', 'True anonymity.']} 
                className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400"
              />
            </motion.h1>

            <motion.p 
              initial="hidden" animate="visible" variants={fadeUp}
              className="text-lg text-[#A1A1AA] max-w-2xl leading-8 mb-10 font-medium"
            >
              Create a unique email alias for every signup. Your personal inbox stays private.
            </motion.p>

            <motion.div 
              initial="hidden" animate="visible" variants={fadeUp}
              className="flex flex-col w-full max-w-md gap-4 pointer-events-auto mb-12"
            >
              <form onSubmit={handleDemoGenerate} className="relative flex items-center w-full group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#A1A1AA]">
                  <Globe className="w-5 h-5 group-focus-within:text-[#6366F1] transition-colors" />
                </div>
                <input 
                  type="text" 
                  value={demoInput}
                  onChange={(e) => setDemoInput(e.target.value)}
                  placeholder="e.g. netflix, amazon..." 
                  className="w-full bg-[#111113]/80 border border-[#27272A] focus:border-[#6366F1]/50 text-white rounded-full py-4 pl-12 pr-32 outline-none transition-all shadow-inner backdrop-blur-md placeholder:text-[#3F3F46]"
                />
                <button 
                  type="submit" 
                  disabled={demoStatus === 'generating'}
                  className="absolute right-2 top-2 bottom-2 bg-white text-black font-medium px-6 rounded-full transition-all hover:bg-neutral-200 active:scale-95 flex items-center justify-center text-sm disabled:opacity-80"
                >
                  {demoStatus === 'generating' ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : 'Generate'}
                </button>
              </form>

              <AnimatePresence>
                {demoStatus === 'done' && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 rounded-2xl bg-[#6366F1]/10 border border-[#6366F1]/30 backdrop-blur-md mt-2"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#6366F1] flex items-center justify-center flex-shrink-0 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                      <Check className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-[#A1A1AA] font-medium mb-1">Your secure alias:</div>
                      <div className="text-sm text-white font-mono">{demoAlias}</div>
                    </div>
                    <Link href="/register" className="text-xs font-semibold text-[#FAFAFA] bg-[#6366F1] px-4 py-2 rounded-full hover:bg-[#4F46E5] transition-colors shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                      Claim it
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>

              {demoStatus === 'idle' && (
                <div className="flex gap-4 items-center mt-2">
                  <Link href="/register" className="bg-white text-black font-medium px-8 py-3.5 rounded-full transition-all hover:bg-neutral-200 active:scale-95 flex items-center gap-2 text-sm group/btn">
                    Start protecting <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              )}
            </motion.div>
          </div>



        </div>
      </main>

      {/* 3. Social Proof Bar */}
      <section className="border-b border-white/5 bg-[#09090B] relative z-20">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-sm text-[#A1A1AA]">
             <span>Securing over <strong className="text-white font-medium">10,000+</strong> inboxes daily.</span>
          </div>
        </div>
      </section>



      {/* 4. Problem Section */}
      <section id="problem" className="py-40 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto">
          <motion.h2 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
            className="text-4xl md:text-6xl font-semibold tracking-tight mb-8 leading-tight"
          >
            Your email<br/>was never meant<br/>to be public.
          </motion.h2>
          <motion.p 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
            className="text-xl text-[#A1A1AA] leading-8"
          >
            Every signup increases your digital footprint.
          </motion.p>
        </div>
      </section>

      {/* 5. Solution Section */}
      <section className="py-40 bg-[#111113] border-y border-[#27272A]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <motion.h2 
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
              className="text-4xl md:text-6xl font-semibold tracking-tight mb-8 leading-tight"
            >
              A different email.<br/>Every time.
            </motion.h2>
            <motion.p 
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
              className="text-xl text-[#A1A1AA] leading-8 mb-16"
            >
              Create a dedicated address for every account. Disable it whenever you need.
            </motion.p>
          </div>
          
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
            className="max-w-md mx-auto mt-16"
          >
            <div className="bg-[#09090B] border border-white/5 rounded-2xl p-6">
              <div className="space-y-4">
                
                {/* Active Alias */}
                <div className="flex items-center justify-between transition-colors hover:bg-[#111113] p-2 -mx-2 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#111113] border border-white/5 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">N</span>
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium text-white tracking-wide">netflix@invisimail.com</div>
                      <div className="text-xs text-[#A1A1AA] flex items-center gap-1.5 mt-1">
                        <Mail className="w-3 h-3" /> Forwarding active
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-[#A1A1AA]">Active</div>
                </div>

                <div className="h-px w-full bg-white/5" />

                {/* Blocked Alias */}
                <div className="flex items-center justify-between opacity-60 transition-colors hover:bg-[#111113] p-2 -mx-2 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#111113] border border-white/5 flex items-center justify-center">
                      <span className="text-[#A1A1AA] text-sm font-medium">?</span>
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium text-[#A1A1AA] tracking-wide line-through decoration-white/20">shady-site@invisimail.com</div>
                      <div className="text-xs text-[#A1A1AA] flex items-center gap-1.5 mt-1">
                        <Shield className="w-3 h-3" /> Blocked
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-[#A1A1AA]">Blocked</div>
                </div>

              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 6. Features (Bento Grid) */}
      <section id="features" className="py-40 max-w-7xl mx-auto px-6">
        <div className="text-center mb-24 max-w-2xl mx-auto">
          <motion.h2 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="text-4xl md:text-5xl font-semibold tracking-tight"
          >
            Built for control.
          </motion.h2>
        </div>

        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]"
        >
          {/* Card 1: Large Feature */}
          <motion.div variants={fadeUp} className="md:col-span-2 md:row-span-2 bg-[#09090B] border border-white/5 rounded-3xl p-8 relative group hover:bg-[#111113] transition-colors duration-500">
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="w-12 h-12 flex items-center justify-center text-[#A1A1AA] mb-6 group-hover:text-white transition-colors duration-500">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-medium tracking-tight text-white mb-3">Unlimited Aliases</h3>
                <p className="text-[#A1A1AA] text-base max-w-md">Generate a unique, burner email for every single service you use. If one gets compromised, just delete it. Your real inbox stays pure.</p>
              </div>
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div variants={fadeUp} className="bg-[#09090B] border border-white/5 rounded-3xl p-8 relative group hover:bg-[#111113] transition-colors duration-500">
            <div className="relative z-10 flex flex-col justify-between h-full">
               <Shield className="w-6 h-6 text-[#A1A1AA] group-hover:text-white transition-colors duration-300" />
               <div>
                 <h3 className="text-lg font-medium text-white mb-2">Private by Default</h3>
                 <p className="text-sm text-[#A1A1AA]">Zero-knowledge architecture. We don't read, store, or sell your emails.</p>
               </div>
            </div>
          </motion.div>

          {/* Card 3 */}
          <motion.div variants={fadeUp} className="bg-[#09090B] border border-white/5 rounded-3xl p-8 relative group hover:bg-[#111113] transition-colors duration-500">
             <div className="relative z-10 flex flex-col justify-between h-full">
               <Zap className="w-6 h-6 text-[#A1A1AA] group-hover:text-white transition-colors duration-300" />
               <div>
                 <h3 className="text-lg font-medium text-white mb-2">Instant Forwarding</h3>
                 <p className="text-sm text-[#A1A1AA]">Mails are routed in milliseconds. No delays, no missing verifications.</p>
               </div>
            </div>
          </motion.div>

          {/* Card 4 */}
          <motion.div variants={fadeUp} className="bg-[#09090B] border border-white/5 rounded-3xl p-8 relative group hover:bg-[#111113] transition-colors duration-500">
             <div className="relative z-10 flex flex-col justify-between h-full">
               <EyeOff className="w-6 h-6 text-[#A1A1AA] group-hover:text-white transition-colors duration-300" />
               <div>
                 <h3 className="text-lg font-medium text-white mb-2">Stop Trackers</h3>
                 <p className="text-sm text-[#A1A1AA]">Automatically strip hidden spy pixels before they reach your inbox.</p>
               </div>
            </div>
          </motion.div>

          {/* Card 5: Wide Feature */}
          <motion.div variants={fadeUp} className="md:col-span-2 bg-[#09090B] border border-white/5 rounded-3xl p-8 relative group hover:bg-[#111113] transition-colors duration-500">
             <div className="relative z-10 flex items-center justify-between h-full">
               <div className="max-w-xs">
                 <h3 className="text-lg font-medium text-white mb-2">Custom Domains</h3>
                 <p className="text-sm text-[#A1A1AA]">Bring your own domain for ultimate professionalism and control.</p>
               </div>
               <div className="w-16 h-16 rounded-full border border-white/5 bg-[#111113] flex items-center justify-center group-hover:border-white/20 transition-all duration-500">
                 <Server className="w-6 h-6 text-[#A1A1AA] group-hover:text-white" />
               </div>
            </div>
          </motion.div>

        </motion.div>
      </section>

      {/* 6. Security Focus */}
      <section className="py-40 bg-[#09090B] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Security Left */}
            <div className="w-full lg:w-[50%] flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8 self-start">
                <span className="text-xs font-medium text-[#A1A1AA]">Zero Knowledge Architecture</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-6 leading-tight">Privacy.<br/>By design.</h2>
              <p className="text-lg text-[#A1A1AA] leading-relaxed max-w-md">
                Every alias is isolated. Your personal email remains private. We don't read, store, or analyze your communications. 
              </p>
            </div>
            
            {/* Security Right - Clean Visual */}
            <div className="w-full lg:w-[50%] bg-[#111113] border border-white/5 rounded-3xl p-12 flex flex-col justify-center relative overflow-hidden min-h-[400px]">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.02),transparent_50%)]" />
              <div className="relative z-10 w-full max-w-sm mx-auto">
                <div className="bg-[#09090B] border border-white/5 rounded-2xl p-4 shadow-xl mb-4 transform -rotate-2">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-white" />
                    <div className="text-sm font-medium text-white">Encryption active</div>
                  </div>
                </div>
                <div className="bg-[#09090B] border border-white/5 rounded-2xl p-4 shadow-xl ml-8 transform rotate-1">
                  <div className="flex items-center gap-3">
                    <EyeOff className="w-5 h-5 text-white" />
                    <div className="text-sm font-medium text-white">Trackers blocked</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. How It Works */}
      <section id="how-it-works" className="py-40 bg-[#111113] border-y border-[#27272A] overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-32">
            <motion.h2 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4"
            >
              How it works
            </motion.h2>
          </div>

          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="relative"
          >
            {/* The main track line */}
            <div className="absolute top-6 left-0 w-full h-[1px] bg-white/5 hidden md:block" />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-16 md:gap-6 relative z-10">
              {[
                { title: "Generate", desc: "Create a unique alias in one click.", icon: <Sparkles className="w-5 h-5 text-[#A1A1AA] group-hover:text-white transition-colors" /> },
                { title: "Use", desc: "Give it to any service or newsletter.", icon: <Globe className="w-5 h-5 text-[#A1A1AA] group-hover:text-white transition-colors" /> },
                { title: "Receive", desc: "Emails forward safely to your inbox.", icon: <Inbox className="w-5 h-5 text-[#A1A1AA] group-hover:text-white transition-colors" /> },
                { title: "Control", desc: "Pause or delete the alias anytime.", icon: <Lock className="w-5 h-5 text-[#A1A1AA] group-hover:text-white transition-colors" /> }
              ].map((step, i) => (
                <div key={i} className="group flex flex-col items-center text-center cursor-default">
                  {/* Node */}
                  <div className="w-12 h-12 rounded-xl bg-[#09090B] border border-white/5 flex items-center justify-center mb-8 relative transition-all duration-300">
                     {step.icon}
                     
                     {/* Mobile connector line */}
                     {i !== 3 && <div className="absolute top-[3.5rem] left-1/2 -translate-x-1/2 w-[1px] h-16 bg-white/5 md:hidden" />}
                  </div>

                  {/* Content */}
                  <span className="text-xs font-medium text-[#A1A1AA] mb-3 block">0{i+1}</span>
                  <h3 className="text-lg font-medium text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-[#A1A1AA] max-w-[200px]">{step.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 8. Dashboard */}
      <section className="py-40 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <motion.h2 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="text-4xl md:text-6xl font-semibold tracking-tight mb-8 leading-tight"
          >
            Everything.<br/>One dashboard.
          </motion.h2>
          <motion.p 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="text-xl text-[#A1A1AA] leading-8"
          >
            Manage aliases, forwarding, and activity from a single dashboard.
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full bg-[#09090B] border border-white/10 rounded-2xl overflow-hidden flex flex-col h-[650px] relative z-10"
        >
          {/* Clean Window Header */}
          <div className="h-12 border-b border-white/5 bg-[#09090B] flex items-center justify-center shrink-0">
            <div className="text-xs font-medium text-[#A1A1AA]">app.invisimail.com</div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 border-r border-white/5 p-6 hidden md:flex flex-col gap-8 bg-[#09090B]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                  <Mail className="w-5 h-5 text-black" />
                </div>
                <span className="font-semibold text-lg text-white">InvisiMail</span>
              </div>
              <div className="flex flex-col gap-2">
                <div className="px-4 py-2.5 bg-white/10 rounded-lg text-sm font-medium text-white border border-white/5">Aliases</div>
                <div className="px-4 py-2.5 text-[#A1A1AA] hover:text-white rounded-lg text-sm font-medium transition-colors">Inbox</div>
                <div className="px-4 py-2.5 text-[#A1A1AA] hover:text-white rounded-lg text-sm font-medium transition-colors">Analytics</div>
                <div className="px-4 py-2.5 text-[#A1A1AA] hover:text-white rounded-lg text-sm font-medium transition-colors">Settings</div>
              </div>
            </div>
            
            {/* Main Content Area */}
            <div className="flex-1 p-8 flex flex-col gap-8 bg-[#09090B]">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-medium text-white">My Aliases</h3>
                <button className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-200 transition-all">New Alias</button>
              </div>

              {/* Analytics Cards */}
              <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#111113] border border-white/5 p-5 rounded-xl">
                    <div className="text-[#A1A1AA] text-sm mb-2 flex items-center gap-2"><Layers className="w-4 h-4" /> Total Forwarded</div>
                    <div className="text-2xl font-semibold text-white">1,204</div>
                  </div>
                  <div className="bg-[#111113] border border-white/5 p-5 rounded-xl relative overflow-hidden">
                    <div className="text-[#A1A1AA] text-sm mb-2 flex items-center gap-2"><Shield className="w-4 h-4 text-[#A1A1AA]" /> Spam Blocked</div>
                    <div className="text-2xl font-semibold text-white">342</div>
                  </div>
              </div>

              {/* Alias List */}
              <div className="flex-1 bg-[#111113] border border-white/5 rounded-xl overflow-hidden flex flex-col">
                {[
                  { name: 'netflix-subs', domain: 'invisimail.com', status: 'Active' },
                  { name: 'github-dev', domain: 'invisimail.com', status: 'Active' },
                  { name: 'random-blog', domain: 'invisimail.com', status: 'Paused' }
                ].map((item, idx) => (
                  <div key={idx} className="p-4 border-b border-white/5 flex justify-between items-center hover:bg-[#18181B] transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#18181B] border border-white/5 flex items-center justify-center">
                        <Mail className="w-4 h-4 text-[#A1A1AA]" />
                      </div>
                      <div>
                        <div className="font-medium text-sm text-white">{item.name}@{item.domain}</div>
                        <div className="text-xs text-[#A1A1AA]">Forwarding</div>
                      </div>
                    </div>
                    <div className="text-sm text-[#A1A1AA]">
                      {item.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 10. FAQ */}
      <section id="faq" className="py-40 max-w-3xl mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-16 text-center">Frequently Asked Questions</h2>
        
        <div className="flex flex-col gap-4">
          {FAQS.map((faq, idx) => (
            <div 
              key={idx} 
              className={`bg-[#09090B] border ${openFaq === idx ? 'border-white/20' : 'border-white/5'} rounded-2xl overflow-hidden transition-all duration-300 hover:border-white/10 cursor-pointer`}
              onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
            >
              <div className="px-6 py-5 flex justify-between items-center">
                <h3 className="text-base font-medium">{faq.q}</h3>
                <ChevronDown className={`w-5 h-5 text-[#A1A1AA] transition-transform duration-300 ${openFaq === idx ? 'rotate-180 text-white' : ''}`} />
              </div>
              <AnimatePresence>
                {openFaq === idx && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="px-8 pb-6"
                  >
                    <p className="text-[#A1A1AA] leading-8 text-base">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* 11. Final CTA */}
      <section className="py-40 max-w-5xl mx-auto px-6 text-center">
        <motion.h2 
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
          className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 text-[#FAFAFA] leading-tight"
        >
          Ready for<br/>private email?
        </motion.h2>
        <motion.p 
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
          className="text-xl text-[#A1A1AA] leading-8 mb-12 max-w-2xl mx-auto"
        >
          Create your first alias in seconds.
        </motion.p>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <Link href="/register" className="inline-block bg-white text-black font-medium px-10 py-4 rounded-full transition-all hover:bg-neutral-200 active:scale-95 text-lg">
            Get Started
          </Link>
        </motion.div>
      </section>

      {/* 12. Footer */}
      <footer className="border-t border-[#27272A] bg-[#09090B] pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-16">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 4L6 8V15C6 21 10.5 26.5 16 28C21.5 26.5 26 21 26 15V8L16 4Z" stroke="url(#logo_grad_footer)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 11.5L16 16.5L23 11.5" stroke="url(#logo_grad_footer)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <defs>
                      <linearGradient id="logo_grad_footer" x1="6" y1="4" x2="26" y2="28" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#818CF8" />
                        <stop offset="1" stopColor="#C084FC" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <span className="font-bold text-xl">InvisiMail</span>
              </div>
              <p className="text-[#A1A1AA] leading-relaxed max-w-sm mb-6">
                The privacy-first email aliasing service with built-in AI intelligence. Reclaim your inbox.
              </p>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full border border-[#27272A] flex items-center justify-center hover:border-[#6366F1] text-[#A1A1AA] hover:text-white cursor-pointer transition-colors text-sm font-bold">X</div>
                <div className="w-10 h-10 rounded-full border border-[#27272A] flex items-center justify-center hover:border-[#6366F1] text-[#A1A1AA] hover:text-white cursor-pointer transition-colors text-sm font-bold">Gh</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-6">Product</h4>
              <ul className="flex flex-col gap-4 text-[#A1A1AA]">
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How it works</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Changelog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-6">Company</h4>
              <ul className="flex flex-col gap-4 text-[#A1A1AA]">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-6">Legal</h4>
              <ul className="flex flex-col gap-4 text-[#A1A1AA]">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#27272A] pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[#3F3F46]">
            <div>&copy; {new Date().getFullYear()} InvisiMail. All rights reserved.</div>
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-[#22C55E]" />
               <span>All systems operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}