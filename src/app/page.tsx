'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import {
  Scale, Shield, Clock, FileText, Users, BarChart3, Calendar,
  Brain, ArrowRight, CheckCircle2, Star, Zap, Globe2, Lock,
  TrendingUp, Briefcase, Gavel, Target, ChevronRight
} from 'lucide-react';

/* ─────────── Animation Variants ─────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
};

/* ─────────── Data ─────────── */
const FEATURES = [
  { icon: Briefcase, title: 'Case Management', desc: 'Track every case from intake to closure. Organize files, timelines, parties, and critical dates in one unified hub.', color: 'from-emerald-500 to-teal-500' },
  { icon: Target, title: 'Smart Task Board', desc: 'Kanban-style boards with drag-and-drop. Assign tasks to team members, set deadlines, and never miss a deliverable.', color: 'from-amber-500 to-orange-500' },
  { icon: FileText, title: 'Document Vault', desc: 'Version-controlled document management with folders, tags, and advanced search. Upload, organize, and retrieve instantly.', color: 'from-blue-500 to-cyan-500' },
  { icon: Clock, title: 'Time Tracking', desc: 'One-click timers, manual entries, and automatic billing calculations. Every billable minute captured accurately.', color: 'from-violet-500 to-purple-500' },
  { icon: Calendar, title: 'Court Calendar', desc: 'All hearings, filings, deadlines, and meetings in one calendar. Color-coded by event type with smart reminders.', color: 'from-rose-500 to-pink-500' },
  { icon: Users, title: 'Team Collaboration', desc: 'Manage associates, paralegals, and partners. Role-based assignments with real-time task tracking.', color: 'from-sky-500 to-blue-500' },
  { icon: Shield, title: 'Evidence & Discovery', desc: 'Chain-of-custody tracking, privilege logs, and evidence categorization. Litigation-ready organization.', color: 'from-red-500 to-rose-500' },
  { icon: Brain, title: 'AI Legal Assistant', desc: 'AI-powered legal research, document analysis, and case strategy suggestions. Your 24/7 legal co-pilot.', color: 'from-indigo-500 to-violet-500' },
  { icon: BarChart3, title: 'Reports & Analytics', desc: 'Real-time dashboards with revenue tracking, case velocity, team productivity, and financial forecasting.', color: 'from-teal-500 to-emerald-500' },
];

const AUDIENCES = [
  { role: 'Senior Partners', desc: 'Get a bird\'s-eye view of your entire firm. Track revenue, case pipelines, and team performance from a single dashboard.', icon: Gavel },
  { role: 'Managing Associates', desc: 'Stay on top of every case detail. Manage deadlines, coordinate with team members, and ensure nothing falls through the cracks.', icon: Scale },
  { role: 'Solo Practitioners', desc: 'Run your entire practice from one platform. From client intake to billing, everything you need without the overhead.', icon: Zap },
  { role: 'In-House Counsel', desc: 'Manage external counsel, track litigation matters, and keep stakeholders informed with automated reporting.', icon: Globe2 },
];

const STATS = [
  { value: '10x', label: 'Faster Case Setup', sublabel: 'vs. manual processes' },
  { value: '40%', label: 'More Billable Hours', sublabel: 'captured automatically' },
  { value: '99.9%', label: 'Uptime', sublabel: 'enterprise-grade reliability' },
  { value: '500+', label: 'Law Firms', sublabel: 'trust Wakeely Pro' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Create Your Account', desc: 'Sign up in under 60 seconds. No credit card required. Import your existing cases or start fresh.', cta: 'Get Started Free' },
  { step: '02', title: 'Set Up Your Cases', desc: 'Add your active cases with all details — parties, court info, critical dates, and opposing counsel. Our guided setup makes it effortless.', cta: 'Import Cases' },
  { step: '03', title: 'Invite Your Team', desc: 'Add associates, paralegals, and staff. Assign roles and permissions. Everyone stays aligned in real-time.', cta: 'Add Team Members' },
  { step: '04', title: 'Run Your Practice', desc: 'Manage tasks, track time, calendar events, billing, and documents — all from one powerful platform.', cta: 'Start Managing' },
];

/* ─────────── Components ─────────── */

function Navbar() {
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60"
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <Scale className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-extrabold text-xl tracking-tight">
            Wakeely <span className="text-emerald-600">Pro</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#features" className="hover:text-emerald-600 transition-colors">Features</a>
          <a href="#who" className="hover:text-emerald-600 transition-colors">Who It\'s For</a>
          <a href="#how" className="hover:text-emerald-600 transition-colors">How It Works</a>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/app"
            className="hidden sm:inline-flex text-sm font-semibold text-slate-700 hover:text-emerald-600 transition-colors"
          >
            Sign In
          </a>
          <a
            href="/app"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 hover:-translate-y-0.5"
          >
            Start Free <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </motion.nav>
  );
}

function HeroSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-emerald-50/30" />
        <div className="absolute top-20 left-1/4 w-[600px] h-[600px] bg-emerald-400/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 right-1/4 w-[500px] h-[500px] bg-teal-400/10 rounded-full blur-[120px]" />
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <motion.div style={{ y, opacity }} className="relative max-w-6xl mx-auto px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-sm font-semibold mb-8"
        >
          <Zap className="w-4 h-4" />
          Built for Lawyers. Powered by AI.
          <ChevronRight className="w-4 h-4" />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] mb-6"
        >
          <span className="text-slate-900">Run Your </span>
          <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
            Entire Practice
          </span>
          <br />
          <span className="text-slate-900">From One Platform</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-500 leading-relaxed mb-10"
        >
          Wakeely Pro is the <strong className="text-slate-700">all-in-one litigation management platform</strong> built
          specifically for law firms. Cases, tasks, billing, documents, calendar, AI assistant —
          <strong className="text-slate-700"> everything in one place</strong>.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="/app"
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-lg rounded-2xl shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 hover:-translate-y-1"
          >
            Start Free — No Credit Card
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 opacity-0 group-hover:opacity-20 transition-opacity" />
          </a>
          <a
            href="#features"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-700 font-bold text-lg rounded-2xl border-2 border-slate-200 hover:border-emerald-300 hover:text-emerald-700 transition-all duration-300 hover:-translate-y-1 shadow-sm"
          >
            See How It Works
          </a>
        </motion.div>

        {/* Trust bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400"
        >
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <span>SOC 2 Compliant</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-slate-300" />
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>256-bit Encryption</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-slate-300" />
          <div className="flex items-center gap-2">
            <Globe2 className="w-4 h-4" />
            <span>Arabic & English</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-6 h-10 rounded-full border-2 border-slate-300 flex justify-center pt-2"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        </motion.div>
      </motion.div>
    </section>
  );
}

function StatsSection() {
  return (
    <section className="py-20 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="max-w-6xl mx-auto px-6 relative">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {STATS.map((stat, i) => (
            <motion.div key={stat.label} variants={fadeUp} custom={i} className="text-center">
              <div className="text-4xl sm:text-5xl font-black text-white mb-2">{stat.value}</div>
              <div className="text-emerald-100 font-bold text-lg">{stat.label}</div>
              <div className="text-emerald-200/70 text-sm mt-1">{stat.sublabel}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="py-24 sm:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={stagger}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-bold mb-6">
            <Star className="w-4 h-4" /> POWERFUL FEATURES
          </motion.div>
          <motion.h2 variants={fadeUp} custom={1} className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-6">
            Everything Your Law Firm Needs.
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent"> Nothing It Doesn\'t.</span>
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="text-xl text-slate-500 leading-relaxed">
            Nine powerful modules designed specifically for litigation practice. No bloat, no fluff —
            just the tools that <strong className="text-slate-700">actually move cases forward</strong>.
          </motion.p>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              variants={scaleIn}
              custom={i}
              className="group relative p-8 rounded-3xl border border-slate-200 bg-white hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 hover:-translate-y-2"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-7 h-7 text-white" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function WhoIsItForSection() {
  return (
    <section id="who" className="py-24 sm:py-32 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={stagger}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-bold mb-6">
            <Users className="w-4 h-4" /> BUILT FOR LEGAL PROFESSIONALS
          </motion.div>
          <motion.h2 variants={fadeUp} custom={1} className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-6">
            Designed for <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Every Legal Role</span>
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="text-xl text-slate-500 leading-relaxed">
            Whether you\'re a solo practitioner or managing a 50-lawyer firm, Wakeely Pro adapts to how <strong className="text-slate-700">you</strong> work.
          </motion.p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid md:grid-cols-2 gap-8"
        >
          {AUDIENCES.map((audience, i) => (
            <motion.div
              key={audience.role}
              variants={fadeUp}
              custom={i}
              className="relative p-8 rounded-3xl bg-white border border-slate-200 hover:border-emerald-200 transition-all duration-500 hover:shadow-xl"
            >
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
                  <audience.icon className="w-7 h-7 text-emerald-600" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-slate-900 mb-3">{audience.role}</h3>
                  <p className="text-slate-500 leading-relaxed">{audience.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section id="how" className="py-24 sm:py-32 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={stagger}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-bold mb-6">
            <TrendingUp className="w-4 h-4" /> GET STARTED IN MINUTES
          </motion.div>
          <motion.h2 variants={fadeUp} custom={1} className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-6">
            Up and Running in <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">4 Simple Steps</span>
          </motion.h2>
        </motion.div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-emerald-200 via-teal-200 to-transparent hidden sm:block" />

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="space-y-12"
          >
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={step.step}
                variants={fadeUp}
                custom={i}
                className={`relative flex flex-col md:flex-row items-start gap-6 md:gap-12 ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
              >
                {/* Number circle */}
                <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black text-xl shadow-xl shadow-emerald-500/30 z-10 hidden sm:flex">
                  {step.step}
                </div>

                {/* Mobile number */}
                <div className="sm:hidden w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black text-sm shadow-lg shrink-0">
                  {step.step}
                </div>

                {/* Content card */}
                <div className={`ml-20 md:ml-0 md:w-[calc(50%-3rem)] ${i % 2 === 1 ? 'md:text-left' : 'md:text-right'}`}>
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-200 hover:shadow-lg transition-all duration-300">
                    <h3 className="text-2xl font-extrabold text-slate-900 mb-3">{step.title}</h3>
                    <p className="text-slate-500 leading-relaxed mb-4">{step.desc}</p>
                    <span className="inline-flex items-center gap-2 text-emerald-600 font-bold text-sm hover:gap-3 transition-all cursor-pointer">
                      {step.cta} <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>

                {/* Spacer for opposite side */}
                <div className="hidden md:block md:w-[calc(50%-3rem)]" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-24 sm:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[150px]" />

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={stagger}
        >
          <motion.h2
            variants={fadeUp}
            className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight mb-6 leading-tight"
          >
            Ready to Transform
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              Your Legal Practice?
            </span>
          </motion.h2>
          <motion.p variants={fadeUp} custom={1} className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Join hundreds of law firms already using Wakeely Pro to manage cases faster,
            bill more accurately, and deliver better client outcomes.
          </motion.p>

          <motion.div variants={fadeUp} custom={2} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <a
              href="/app"
              className="group inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-lg rounded-2xl shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 hover:-translate-y-1"
            >
              Start Your Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>

          <motion.div variants={fadeUp} custom={3} className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Free 14-day trial</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Arabic & English</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Scale className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                Wakeely <span className="text-emerald-400">Pro</span>
              </span>
            </div>
            <p className="text-slate-500 leading-relaxed max-w-md">
              The all-in-one litigation case management platform built specifically for law firms in the Gulf region.
              Manage your entire practice from a single, powerful interface.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Product</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#features" className="hover:text-emerald-400 transition-colors">Features</a></li>
              <li><a href="#how" className="hover:text-emerald-400 transition-colors">How It Works</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Changelog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-emerald-400 transition-colors">About</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <p>&copy; {new Date().getFullYear()} Wakeely Pro. All rights reserved.</p>
          <p className="text-slate-600">Built for lawyers. Powered by technology.</p>
        </div>
      </div>
    </footer>
  );
}

/* ─────────── Page ─────────── */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <WhoIsItForSection />
      <HowItWorksSection />
      <CTASection />
      <Footer />
    </div>
  );
}