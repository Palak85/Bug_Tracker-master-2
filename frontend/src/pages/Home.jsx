import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  Bug,
  CheckSquare,
  Users,
  Shield,
  Zap,
  Filter,
  ArrowRight,
  BarChart3,
  Bell,
  Search,
  Star,
} from 'lucide-react';
import ScrollExpandMedia from '../components/ui/scroll-expansion-hero';
import { useDarkMode } from '../hooks/useDarkMode';

/* ────────── reusable fade-in on scroll ────────── */
const FadeIn = ({ children, delay = 0, className = '' }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};

/* ────────── feature data ────────── */
const features = [
  {
    icon: Bug,
    gradient: 'from-purple-500 to-indigo-600',
    shadow: 'shadow-purple-200',
    title: 'Smart Bug Tracking',
    desc: 'Report, triage, and resolve bugs with severity & priority tagging. Full audit trail from report to closure.',
  },
  {
    icon: CheckSquare,
    gradient: 'from-indigo-500 to-violet-600',
    shadow: 'shadow-indigo-200',
    title: 'Task Management',
    desc: 'Assign tasks, set deadlines, and track sprint progress — all in one beautiful place.',
  },
  {
    icon: Filter,
    gradient: 'from-purple-400 to-pink-500',
    shadow: 'shadow-pink-200',
    title: 'Advanced Filtering',
    desc: 'Instantly slice your backlog by status, priority, severity, project, or assignee.',
  },
  {
    icon: Users,
    gradient: 'from-indigo-400 to-purple-500',
    shadow: 'shadow-indigo-200',
    title: 'Team Collaboration',
    desc: 'Admins, managers, and developers each get tailored views and controlled permissions.',
  },
  {
    icon: Shield,
    gradient: 'from-violet-500 to-purple-600',
    shadow: 'shadow-violet-200',
    title: 'Admin Approval Flow',
    desc: 'Every new user goes through admin validation before gaining access. Zero rogue accounts.',
  },
  {
    icon: BarChart3,
    gradient: 'from-purple-500 to-indigo-500',
    shadow: 'shadow-purple-200',
    title: 'Progress Analytics',
    desc: 'Real-time stats — open vs. resolved, critical risk, active targets — visible at a glance.',
  },
];

/* ────────── roles data ────────── */
const roles = [
  {
    icon: Shield,
    label: 'Administrator',
    accent: 'text-purple-600',
    border: 'border-purple-200',
    bg: 'bg-purple-50',
    badgeBg: 'bg-gradient-to-br from-purple-500 to-indigo-600',
    points: ['Approve & manage all users', 'Full CRUD on bugs & tasks', 'View all team activity'],
  },
  {
    icon: Users,
    label: 'Project Manager',
    accent: 'text-indigo-600',
    border: 'border-indigo-200',
    bg: 'bg-indigo-50',
    badgeBg: 'bg-gradient-to-br from-indigo-500 to-purple-600',
    points: ['Create & assign tasks', 'Monitor sprint progress', 'Edit all bugs & tasks'],
  },
  {
    icon: Zap,
    label: 'Developer',
    accent: 'text-violet-600',
    border: 'border-violet-200',
    bg: 'bg-violet-50',
    badgeBg: 'bg-gradient-to-br from-violet-500 to-indigo-500',
    points: ['Report new bugs', 'Update assigned items', 'Track personal workload'],
  },
];

/* ────────── stats ────────── */
const stats = [
  { value: '10k+', label: 'Bugs Resolved' },
  { value: '3',    label: 'Role Levels'  },
  { value: '99%',  label: 'Uptime'       },
  { value: '< 1s', label: 'Filter Speed' },
];

/* ════════════════════════════ HOME PAGE ════════════════════════════ */
export default function Home() {
  useDarkMode(); // apply stored theme preference
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="bg-[#e9edf5] text-gray-800 overflow-x-hidden">

      {/* ── Global background blobs (same as Login page) ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute w-[700px] h-[700px] bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full blur-[160px] top-[-250px] left-[-250px] opacity-30" />
        <div className="absolute w-[600px] h-[600px] bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full blur-[160px] bottom-[-200px] right-[-200px] opacity-30" />
        <div className="absolute w-[400px] h-[400px] bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full blur-[120px] top-[40%] left-[50%] -translate-x-1/2 opacity-20" />
      </div>

      {/* ── HERO via ScrollExpandMedia ── */}
      <div className="relative z-10">
        <ScrollExpandMedia
          mediaType="image"
          mediaSrc="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1280&auto=format&fit=crop"
          bgImageSrc="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=1920&auto=format&fit=crop"
          title="BugFinder Enterprise"
          date="Advanced Bug Tracker"
          scrollToExpand="↓  Scroll to explore"
          textBlend
        >
          <HeroReveal />
        </ScrollExpandMedia>
      </div>

      {/* ── STATS RIBBON ── */}
      <section className="relative z-10 py-10 px-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-[30px] shadow-[0_15px_50px_rgba(0,0,0,0.1)] px-10 py-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <div className="text-center">
                  <p className="text-4xl font-bold bg-gradient-to-br from-purple-500 to-indigo-600 bg-clip-text text-transparent">
                    {s.value}
                  </p>
                  <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mt-1">{s.label}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="relative z-10 py-24 px-8">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-purple-100 text-purple-600 text-xs font-bold uppercase tracking-widest mb-5">
              Everything You Need
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight">
              Built for serious{' '}
              <span className="bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent">
                engineering teams
              </span>
            </h2>
            <p className="text-gray-500 mt-4 text-lg max-w-xl mx-auto">
              Every feature your team needs to ship faster and with higher quality.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <FeatureCard key={i} {...f} delay={i * 0.07} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 3-D DASHBOARD PREVIEW ── */}
      <section className="relative z-10 py-20 px-8">
        <div className="max-w-5xl mx-auto">
          <FadeIn className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-widest mb-5">
              Live Interface
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight">
              Your command centre,{' '}
              <span className="bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent">
                reimagined
              </span>
            </h2>
          </FadeIn>
          <FadeIn delay={0.15}>
            <DashboardTiltCard />
          </FadeIn>
        </div>
      </section>

      {/* ── ROLES ── */}
      <section className="relative z-10 py-24 px-8">
        <div className="max-w-5xl mx-auto">
          <FadeIn className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-purple-100 text-purple-600 text-xs font-bold uppercase tracking-widest mb-5">
              Role-Based Access
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight">
              The right tools for{' '}
              <span className="bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent">
                every team member
              </span>
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roles.map((r, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <RoleCard {...r} />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative z-10 py-24 px-8">
        <div className="max-w-3xl mx-auto">
          {/* Login-style two-panel card */}
          <FadeIn>
            <div className="relative bg-white rounded-[30px] shadow-[0_25px_60px_rgba(0,0,0,0.15)] flex flex-col md:flex-row overflow-hidden min-h-[300px]">

              {/* Left: text + actions */}
              <div className="flex-1 flex flex-col justify-center px-10 py-12 z-10">
                <Star className="w-8 h-8 text-purple-500 mb-5" />
                <h2 className="text-3xl font-bold text-gray-800 mb-3 leading-tight">
                  Ready to ship<br />bug-free software?
                </h2>
                <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                  Register today and an administrator will grant you access within minutes.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/register"
                    className="flex items-center justify-center gap-2 py-3 px-7 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold text-sm shadow-lg hover:scale-[1.03] transition-all"
                  >
                    Get Started <ArrowRight size={15} />
                  </Link>
                  <Link
                    to="/login"
                    className="flex items-center justify-center gap-2 py-3 px-7 rounded-full border border-gray-200 bg-[#f3f5f9] text-gray-600 font-semibold text-sm hover:border-purple-300 hover:text-purple-600 transition-all"
                  >
                    Sign In
                  </Link>
                </div>
              </div>

              {/* Right: purple panel — mirrors the login page right-side */}
              <div className="md:w-[45%] relative flex items-center justify-center text-white min-h-[220px]">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-indigo-600 md:rounded-l-[120px]" />
                <div className="relative z-10 text-center px-10 py-8">
                  <Bug className="w-12 h-12 text-white/80 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-3">BugFinder</h3>
                  <p className="text-purple-100 text-sm leading-relaxed">
                    Manage your bugs efficiently and stay productive with your entire team.
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-white/60 py-10 px-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Bug className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-700">BugFinder Enterprise</span>
          </div>
          <p className="text-gray-400 text-xs tracking-widest uppercase">© 2026 · All rights reserved</p>
          <div className="flex gap-6 text-sm text-gray-400">
            <Link to="/login"    className="hover:text-purple-600 transition-colors">Login</Link>
            <Link to="/register" className="hover:text-purple-600 transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─────── Hero content revealed after ScrollExpand ─────── */
function HeroReveal() {
  return (
    <div className="max-w-3xl mx-auto text-center py-10">
      {/* Login-style card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-white rounded-[30px] shadow-[0_25px_60px_rgba(0,0,0,0.13)] overflow-hidden flex flex-col md:flex-row min-h-[260px]"
      >
        {/* Left: CTA text */}
        <div className="flex-1 flex flex-col justify-center px-10 py-10 text-left">
          <p className="text-xs uppercase tracking-[0.3em] text-purple-500 font-bold mb-3">
            ✦ Now Expanded ✦
          </p>
          <h2 className="text-2xl font-bold text-gray-800 mb-3 leading-snug">
            The modern way to track, collaborate, and ship
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            One platform for every bug, every task, and every team member — from first report to final fix.
          </p>
          <div className="flex gap-3">
            <Link
              to="/register"
              className="flex items-center gap-2 py-2.5 px-6 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-sm font-semibold shadow-lg hover:scale-[1.03] transition-all"
            >
              Start Free <ArrowRight size={14} />
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-2 py-2.5 px-6 rounded-full bg-[#f3f5f9] border border-gray-200 text-gray-600 text-sm font-semibold hover:border-purple-300 hover:text-purple-600 transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Right: accent panel (same as login page right side) */}
        <div className="md:w-[40%] relative flex items-center justify-center min-h-[180px]">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-indigo-600 md:rounded-l-[80px]" />
          <div className="relative z-10 text-center px-8">
            <p className="text-white font-bold text-lg mb-2">Welcome!</p>
            <p className="text-purple-100 text-sm">Manage your bugs efficiently and stay productive.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ─────── Feature card (white card, purple-indigo accent) ─────── */
function FeatureCard({ icon: Icon, gradient, shadow, title, desc, delay }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.08)] p-7 group cursor-default hover:shadow-[0_20px_50px_rgba(139,92,246,0.15)] transition-all duration-500"
    >
      <div
        className={`w-13 h-13 w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-5 shadow-lg ${shadow} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}
      >
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
    </motion.div>
  );
}

/* ─────── 3-D Tilt mock dashboard (white card) ─────── */
function DashboardTiltCard() {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    cardRef.current.style.transform = `perspective(1000px) rotateY(${x * 12}deg) rotateX(${-y * 8}deg) scale3d(1.02,1.02,1.02)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) scale3d(1,1,1)';
  };

  return (
    <div
      className="relative cursor-pointer"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Subtle purple glow ring */}
      <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-400 rounded-[34px] blur-lg opacity-25" />

      <div
        ref={cardRef}
        className="relative bg-white rounded-[30px] shadow-[0_25px_60px_rgba(0,0,0,0.13)] overflow-hidden"
        style={{ transition: 'transform 0.15s ease-out' }}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-7 py-4 border-b border-gray-100 bg-[#f8f9fc]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow">
              <Bug className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-700 text-sm">BugFinder Enterprise</span>
          </div>
          <div className="flex items-center gap-4">
            <Search className="w-4 h-4 text-gray-400" />
            <Bell  className="w-4 h-4 text-gray-400" />
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow">
              A
            </div>
          </div>
        </div>

        {/* Stat row */}
        <div className="grid grid-cols-4 gap-4 p-6">
          {[
            { label: 'Total Bugs',   val: '24', color: 'text-purple-600'  },
            { label: 'Critical',     val: '7',  color: 'text-rose-500'    },
            { label: 'In Progress',  val: '11', color: 'text-indigo-600'  },
            { label: 'Resolved',     val: '6',  color: 'text-emerald-600' },
          ].map((s, i) => (
            <div key={i} className="bg-[#f8f9fc] rounded-2xl p-4 border border-gray-100">
              <p className="text-[9px] uppercase tracking-widest text-gray-400 font-semibold mb-1">{s.label}</p>
              <p className={`text-3xl font-bold ${s.color}`}>{s.val}</p>
              <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full"
                  style={{ width: `${25 + i * 18}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Bug cards row */}
        <div className="grid grid-cols-3 gap-4 px-6 pb-6">
          {[
            { id: 42, title: 'Auth token expires on refresh', status: 'in_progress', project: 'API'    },
            { id: 37, title: 'Dashboard chart flicker on dark mode', status: 'reported',    project: 'UI'     },
            { id: 51, title: 'CSV export encoding breaks on Windows', status: 'resolved',    project: 'Export' },
          ].map((bug) => (
            <div
              key={bug.id}
              className="bg-[#f8f9fc] border border-gray-100 rounded-2xl p-4 hover:border-purple-200 hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">#{bug.id}</span>
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border ${
                  bug.status === 'resolved'
                    ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
                    : bug.status === 'in_progress'
                    ? 'text-indigo-600 bg-indigo-50 border-indigo-200'
                    : 'text-gray-500 bg-gray-100 border-gray-200'
                }`}>
                  {bug.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-gray-700 font-semibold text-xs leading-snug mb-3 line-clamp-2">{bug.title}</p>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 border border-purple-200 font-bold uppercase">
                {bug.project}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────── Role card (white + colored left accent) ─────── */
function RoleCard({ icon: Icon, label, accent, border, bg, badgeBg, points }) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.01 }}
      transition={{ duration: 0.28 }}
      className={`bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.08)] p-7 border ${border} group cursor-default hover:shadow-[0_20px_50px_rgba(139,92,246,0.12)] transition-all duration-400`}
    >
      <div className={`w-12 h-12 rounded-2xl ${badgeBg} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-400`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className={`text-lg font-bold ${accent} mb-4`}>{label}</h3>
      <ul className="space-y-2.5">
        {points.map((p, i) => (
          <li key={i} className="flex items-center gap-3 text-gray-500 text-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0" />
            {p}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
