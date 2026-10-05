import React, { useEffect, useState } from "react";
import {
  Sparkles,
  ArrowRight,
  LayoutTemplate,
  Bold,
  Italic,
  Underline,
  Mail,
  Phone,
  Globe,
  Linkedin,
  Briefcase,
  MapPin,
  Calendar,
  FileText,
  Target,
  Zap,
  Shield,
  Check,
  Plus,
  Share2,
  Download,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { trackEventOncePerSession } from "@/services/analytics";
import { useAuth } from "@/context";

const BLUE = "#1456F0";
const PAGE_BG = "#FAFAFA";
const SERIF = '"Instrument Serif", "Playfair Display", Georgia, serif';
const RESUME_SERIF = '"Source Serif 4", "Merriweather", Georgia, serif';

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Templates", href: "#templates" },
  { label: "FAQs", href: "#faqs" },
];

const CAPABILITIES = [
  "ATS Score",
  "JD Match",
  "Cover Letters",
  "LinkedIn Import",
  "PDF & DOCX",
  "Share Link",
];

const FAQS = [
  {
    q: "Do I need an account to try it?",
    a: "No. You can open the editor as a guest and your work is saved in this browser. Sign up when you want your resumes saved to your account.",
  },
  {
    q: "What can the AI help with?",
    a: "It can rewrite your summary and bullet points, draft bullets for a role, suggest skills, score your resume, match it against a job description, and write a cover letter.",
  },
  {
    q: "Which formats can I export?",
    a: "You can download your resume as a PDF or a DOCX file from the editor.",
  },
  {
    q: "Are the templates ATS-friendly?",
    a: "Yes. The templates use clean, text-based layouts that applicant tracking systems can parse, and the ATS analysis points out missing keywords.",
  },
  {
    q: "Can I share my resume with a link?",
    a: "Yes. Once you are signed in you can turn on sharing for a resume and send its public link.",
  },
];

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const currentYear = new Date().getFullYear();

  /* Analytics */
  useEffect(() => {
    trackEventOncePerSession("funnel_visit_home", "visit_home");
  }, []);

  /* index.html paints the body dark for the app shell; keep overscroll light here */
  useEffect(() => {
    const previous = document.body.style.background;
    document.body.style.background = PAGE_BG;
    return () => {
      document.body.style.background = previous;
    };
  }, []);

  /* Scroll-reveal: one IntersectionObserver for all .reveal elements */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in-view");
            observer.unobserve(e.target);
          }
        }),
      { threshold: 0.1 },
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const startPath = isAuthenticated ? "/history" : "/try";

  const handleStarterSelect = (starterKey: string, starterTitle: string) => {
    localStorage.setItem("starter_resume_key", starterKey);
    localStorage.setItem("starter_resume_title", starterTitle);
    navigate(startPath);
  };

  return (
    <div
      className="min-h-screen overflow-x-hidden font-inter text-[#111111] antialiased"
      style={{ background: PAGE_BG, letterSpacing: "-0.02em" }}
    >
      {/* ── NAV ─────────────────────────────────────────────── */}
      <header className="mx-auto flex max-w-[1320px] items-center justify-between px-5 sm:px-8 pt-5">
        <div className="flex items-center gap-12">
          <a href="/" className="flex items-center gap-2" aria-label="ResumeAI home">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#111111]">
              <FileText className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
            </span>
            <span className="text-[1.45rem] font-semibold tracking-[-0.04em]">ResumeAI</span>
          </a>
          <nav className="hidden md:flex items-center gap-8 text-[0.95rem] text-[#6B6B6B]">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="transition-colors hover:text-[#111111]">
                {link.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2 sm:gap-6">
          {!isAuthenticated && (
            <button
              onClick={() => navigate("/login")}
              className="px-2 py-2 text-[0.95rem] text-[#3D3D3D] transition-colors hover:text-[#111111]"
            >
              Sign In
            </button>
          )}
          <button
            onClick={() => navigate(startPath)}
            className="rounded-lg bg-[#EDEDED] px-4 sm:px-5 py-2.5 text-[0.95rem] font-medium text-[#2B2B2B] transition-colors hover:bg-[#E2E2E2]"
          >
            {isAuthenticated ? "Go to Dashboard" : "Create My Resume"}
          </button>
        </div>
      </header>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="mx-auto grid max-w-[1320px] items-center gap-12 px-5 sm:px-8 pt-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-6 lg:pt-20">
        <div>
          <div
            className="animate-fade-rise inline-flex items-center rounded-lg border border-[#CFCFCF] bg-white/60 px-2.5 py-1.5 text-[0.9rem] text-[#2B2B2B]"
            style={{ animationDelay: "0ms" }}
          >
            Free to try · No signup needed
          </div>

          <h1
            className="animate-fade-rise mt-5 leading-[1.08]"
            style={{
              animationDelay: "120ms",
              fontFamily: SERIF,
              fontSize: "clamp(2.6rem, 4.6vw, 3.9rem)",
              letterSpacing: "-0.035em",
            }}
          >
            <span className="text-[#757575]">Stop struggling with Resumes.</span>
            <br />
            Let AI do the hard part.
          </h1>

          <p
            className="animate-fade-rise mt-7 max-w-[32rem] text-[1.15rem] leading-[1.65] text-[#6B6B6B]"
            style={{ animationDelay: "240ms" }}
          >
            From wording to formatting, our AI resume builder helps you create a
            polished resume that stands out in seconds.
          </p>

          <div
            className="animate-fade-rise mt-8 flex flex-col gap-3 sm:flex-row"
            style={{ animationDelay: "360ms" }}
          >
            <button
              onClick={() => navigate(startPath)}
              className="rounded-lg px-5 py-3 text-[0.98rem] font-medium text-white transition-[filter,transform] hover:brightness-110 active:scale-[0.98]"
              style={{ background: BLUE }}
            >
              {isAuthenticated ? "Go to Dashboard" : "Get Started-It's free"}
            </button>
            <a
              href="#templates"
              className="flex items-center justify-center gap-2 rounded-lg bg-[#EDEDED] px-5 py-3 text-[0.98rem] font-medium text-[#2B2B2B] transition-colors hover:bg-[#E2E2E2]"
            >
              <LayoutTemplate className="h-4 w-4" />
              Start from a Template
            </a>
          </div>

          <div
            className="animate-fade-rise mt-24 flex flex-col gap-5 text-[0.95rem] text-[#6B6B6B] sm:flex-row sm:items-center sm:gap-7"
            style={{ animationDelay: "480ms" }}
          >
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {["A", "S", "C"].map((label, i) => (
                  <span
                    key={label}
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 text-[0.7rem] font-semibold text-white"
                    style={{ borderColor: PAGE_BG, background: ["#2B2B2B", "#6B6B6B", BLUE][i] }}
                  >
                    {label}
                  </span>
                ))}
              </div>
              <span className="leading-snug">
                <span className="font-semibold text-[#111111]">4</span> ATS-ready
                <br />
                resume templates
              </span>
            </div>
            <span className="hidden h-7 w-px bg-[#D9D9D9] sm:block" />
            <div className="flex items-center gap-3">
              <Download className="h-6 w-6 text-[#22A861]" strokeWidth={1.75} />
              <span>
                Export to <span className="font-semibold text-[#111111]">PDF</span> and{" "}
                <span className="font-semibold text-[#111111]">DOCX</span>
              </span>
            </div>
          </div>
        </div>

        <HeroPreview />
      </section>

      {/* ── CAPABILITY STRIP ────────────────────────────────── */}
      <section className="mx-auto mt-24 flex max-w-[1320px] flex-col gap-6 px-5 sm:px-8 lg:flex-row lg:items-center lg:gap-12">
        <p className="shrink-0 text-[0.98rem] leading-snug text-[#2B2B2B] lg:border-r lg:border-[#D9D9D9] lg:pr-12">
          Everything you need
          <br className="hidden lg:block" /> in one editor
        </p>
        <ul className="flex flex-1 flex-wrap items-center justify-between gap-x-10 gap-y-4">
          {CAPABILITIES.map((item) => (
            <li key={item} className="text-[1.45rem] font-semibold tracking-[-0.04em] text-[#9A9A9A]">
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* ── FEATURES ────────────────────────────────────────── */}
      <section id="features" className="mx-auto mt-32 max-w-[1320px] scroll-mt-10 px-5 sm:px-8">
        <SectionHeading
          eyebrow="Features"
          title="Everything you need to stand out"
          subtitle="AI-powered tools designed around how modern hiring actually works."
        />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            { icon: Sparkles, title: "AI Suggestions", desc: "Rewrite summaries and bullet points with phrasing tailored to the role you are targeting." },
            { icon: Target, title: "ATS Optimized", desc: "Score your resume, match it against a job description, and see which keywords are missing." },
            { icon: Zap, title: "Lightning Fast", desc: "Skip the formatting struggles. Fill in your experience and watch the page lay itself out." },
            { icon: FileText, title: "Cover Letters", desc: "Generate a cover letter from your resume and the job description you are applying to." },
            { icon: Share2, title: "Share and Export", desc: "Download as PDF or DOCX, or publish a public link to send to recruiters." },
            { icon: Shield, title: "Never Lose Work", desc: "Changes save automatically as you type, with undo and redo when you change your mind." },
          ].map(({ icon: Icon, title, desc }, i) => (
            <div
              key={title}
              className="reveal rounded-2xl border border-[#E8E8E8] bg-white p-7 transition-shadow hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)]"
              style={{ transitionDelay: `${(i % 3) * 90}ms` }}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF3FF]">
                <Icon className="h-5 w-5" style={{ color: BLUE }} />
              </span>
              <h3 className="mt-5 text-[1.1rem] font-semibold">{title}</h3>
              <p className="mt-2 text-[0.95rem] leading-relaxed text-[#6B6B6B]">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── STARTER TEMPLATES ───────────────────────────────── */}
      <section id="templates" className="mx-auto mt-32 max-w-[1320px] scroll-mt-10 px-5 sm:px-8">
        <SectionHeading
          eyebrow="Templates"
          title="Start from proven resume examples"
          subtitle="Pick a starter, personalize it with your details, and save hours on structure and formatting."
        />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            {
              key: "software-engineer",
              starterTitle: "Software Engineer Starter",
              title: "Software Engineer",
              role: "Backend / Full Stack",
              bullets: ["Impact-focused engineering bullets", "Projects + technical skills sections", "ATS-friendly structure"],
            },
            {
              key: "product-manager",
              starterTitle: "Product Manager Starter",
              title: "Product Manager",
              role: "B2B / SaaS PM",
              bullets: ["Metrics and roadmap-first achievements", "Cross-functional leadership framing", "Clean executive summary format"],
            },
            {
              key: "ui-ux-designer",
              starterTitle: "UI/UX Designer Starter",
              title: "UI/UX Designer",
              role: "Product & Growth Design",
              bullets: ["Portfolio-friendly project highlights", "Design process and outcomes", "Modern visual storytelling"],
            },
          ].map((starter, i) => (
            <div
              key={starter.key}
              className="reveal flex flex-col rounded-2xl border border-[#E8E8E8] bg-white p-7"
              style={{ transitionDelay: `${i * 90}ms` }}
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-[1.5rem] leading-tight" style={{ fontFamily: SERIF }}>
                  {starter.title}
                </h3>
                <span className="mt-1 shrink-0 rounded-md bg-[#F1F1F1] px-2 py-1 text-xs text-[#4A4A4A]">
                  {starter.role}
                </span>
              </div>
              <ul className="mt-5 flex-1 space-y-3">
                {starter.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2.5 text-[0.95rem] text-[#4A4A4A]">
                    <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: BLUE }} />
                    {bullet}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleStarterSelect(starter.key, starter.starterTitle)}
                className="mt-7 flex items-center justify-center gap-2 rounded-lg bg-[#EDEDED] py-2.5 text-[0.95rem] font-medium text-[#2B2B2B] transition-colors hover:bg-[#111111] hover:text-white"
              >
                Use This Starter
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQS ────────────────────────────────────────────── */}
      <section id="faqs" className="mx-auto mt-32 max-w-[820px] scroll-mt-10 px-5 sm:px-8">
        <SectionHeading eyebrow="FAQs" title="Questions, answered" />
        <div className="mt-10 border-t border-[#E3E3E3]">
          {FAQS.map((faq) => (
            <FaqItem key={faq.q} question={faq.q} answer={faq.a} />
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────── */}
      <section className="mx-auto mt-32 max-w-[1320px] px-5 sm:px-8">
        <div className="reveal rounded-3xl bg-[#111111] px-6 py-16 text-center text-white sm:py-20">
          <h2
            className="leading-[1.1]"
            style={{ fontFamily: SERIF, fontSize: "clamp(2.1rem, 4vw, 3.2rem)", letterSpacing: "-0.03em" }}
          >
            <span className="text-[#9A9A9A]">Your next role starts with</span>
            <br />a better resume.
          </h2>
          <p className="mx-auto mt-5 max-w-md text-[1.02rem] leading-relaxed text-[#B5B5B5]">
            Start free, choose a proven template, and turn your experience into
            strong results.
          </p>
          <button
            onClick={() => navigate(startPath)}
            className="mt-8 inline-flex items-center gap-2 rounded-lg px-6 py-3 text-[0.98rem] font-medium text-white transition-[filter,transform] hover:brightness-110 active:scale-[0.98]"
            style={{ background: BLUE }}
          >
            Create My Resume
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer className="mx-auto mt-16 flex max-w-[1320px] flex-col items-center justify-between gap-3 border-t border-[#E3E3E3] px-5 py-8 text-sm text-[#8A8A8A] sm:flex-row sm:px-8">
        <span>© {currentYear} ResumeAI. All rights reserved.</span>
        <nav className="flex gap-6">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="transition-colors hover:text-[#111111]">
              {link.label}
            </a>
          ))}
        </nav>
      </footer>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
═══════════════════════════════════════════════════════════════ */

const SectionHeading = ({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) => (
  <div className="reveal max-w-2xl">
    <span className="inline-flex rounded-lg border border-[#CFCFCF] bg-white/60 px-2.5 py-1 text-[0.85rem] text-[#2B2B2B]">
      {eyebrow}
    </span>
    <h2
      className="mt-4 leading-[1.1]"
      style={{ fontFamily: SERIF, fontSize: "clamp(2rem, 3.4vw, 2.9rem)", letterSpacing: "-0.03em" }}
    >
      {title}
    </h2>
    {subtitle && <p className="mt-4 text-[1.05rem] leading-relaxed text-[#6B6B6B]">{subtitle}</p>}
  </div>
);

const FaqItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#E3E3E3]">
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-6 py-5 text-left text-[1.05rem] font-medium"
      >
        {question}
        <Plus
          className={`h-5 w-5 shrink-0 text-[#6B6B6B] transition-transform duration-200 ${open ? "rotate-45" : ""}`}
        />
      </button>
      {open && <p className="pb-6 pr-10 text-[0.98rem] leading-relaxed text-[#6B6B6B]">{answer}</p>}
    </div>
  );
};

/* Small square tile that floats beside the resume, joined by a hairline connector */
const FloatingTile = ({
  className,
  delay,
  children,
}: {
  className: string;
  delay: string;
  children: React.ReactNode;
}) => (
  <span
    className={`landing-float absolute flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-[0_4px_14px_rgba(0,0,0,0.08)] ${className}`}
    style={{ animationDelay: delay }}
  >
    {children}
  </span>
);

const MetaItem = ({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) => (
  <span className="flex items-center gap-1 whitespace-nowrap">
    <Icon className="h-[10px] w-[10px]" strokeWidth={2.25} />
    {children}
  </span>
);

/* Illustrative product mock — static sample content, hidden from assistive tech */
const HeroPreview: React.FC = () => (
  <div
    aria-hidden="true"
    className="animate-fade-rise relative mx-auto h-[640px] w-[680px] shrink-0 select-none [zoom:0.5] sm:[zoom:0.85] lg:mx-0 lg:[zoom:0.72] xl:[zoom:0.92] 2xl:[zoom:1]"
    style={{ animationDelay: "300ms" }}
  >
    <style>{`
      @keyframes landingFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
      .landing-float { animation: landingFloat 6s ease-in-out infinite; }
      @media (prefers-reduced-motion: reduce) { .landing-float { animation: none; } }
    `}</style>

    {/* Dotted backdrop */}
    <div
      className="absolute -inset-x-10 inset-y-0"
      style={{
        backgroundImage: "radial-gradient(#D4D4D4 1px, transparent 1px)",
        backgroundSize: "13px 13px",
        maskImage: "radial-gradient(ellipse 55% 50% at 50% 50%, #000 30%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(ellipse 55% 50% at 50% 50%, #000 30%, transparent 100%)",
      }}
    />

    {/* Connector lines */}
    <div className="absolute left-[18px] top-[262px] h-[100px] w-[44px] rounded-tl-2xl border-l border-t border-[#DCDCDC]" />
    <div className="absolute right-[4px] top-[118px] h-[86px] w-[36px] rounded-br-2xl border-b border-r border-[#DCDCDC]" />
    <div className="absolute right-[8px] top-[430px] h-[66px] w-[32px] rounded-tr-2xl border-r border-t border-[#DCDCDC]" />

    <FloatingTile className="left-0 top-[348px]" delay="0s">
      <Target className="h-4 w-4" style={{ color: BLUE }} />
    </FloatingTile>
    <FloatingTile className="right-[-14px] top-[84px]" delay="1.5s">
      <FileText className="h-4 w-4 text-[#E0483B]" />
    </FloatingTile>
    <FloatingTile className="right-[-12px] top-[482px]" delay="3s">
      <Share2 className="h-4 w-4 text-[#E8912D]" />
    </FloatingTile>

    {/* Resume sheet */}
    <div
      className="absolute left-[62px] right-[36px] top-[66px] h-[600px] bg-white px-10 pt-9 shadow-[0_2px_40px_rgba(0,0,0,0.05)]"
      style={{
        maskImage: "linear-gradient(to bottom, #000 62%, transparent 96%)",
        WebkitMaskImage: "linear-gradient(to bottom, #000 62%, transparent 96%)",
      }}
    >
      {/* Name (selected) + title */}
      <div className="flex items-end gap-1">
        <div className="relative -ml-2 border border-[#1456F0] px-2 py-0.5">
          {["-left-[3px] -top-[3px]", "-right-[3px] -top-[3px]", "-left-[3px] -bottom-[3px]", "-right-[3px] -bottom-[3px]"].map((pos) => (
            <span key={pos} className={`absolute h-[5px] w-[5px] border border-[#1456F0] bg-white ${pos}`} />
          ))}
          <span className="text-[34px] leading-none tracking-[-0.03em]" style={{ fontFamily: RESUME_SERIF }}>
            Adoma Eze
          </span>
        </div>
        <span className="pb-1 text-[13px] font-medium">UX Engineer</span>
      </div>

      {/* Contact row */}
      <div className="mt-4 flex items-center gap-4 pl-9 text-[9.5px] font-medium text-[#2B2B2B]">
        <MetaItem icon={Mail}>adoma.eze@email.com</MetaItem>
        <MetaItem icon={Phone}>+44 7700 900345</MetaItem>
        <MetaItem icon={Globe}>adomaeze.design</MetaItem>
        <MetaItem icon={Linkedin}>adoma_codes</MetaItem>
      </div>

      {/* Summary */}
      <p
        className="mt-9 bg-gradient-to-r from-[#FAFAFA] via-white to-[#FAFAFA] px-4 py-2.5 text-[12.5px] leading-[1.4] text-[#2B2B2B]"
        style={{ fontFamily: RESUME_SERIF }}
      >
        A passionate user experience engineer committed to creating intuitive
        digital solutions by combining thoughtful design principles with clean,
        efficient code.
      </p>

      {/* Work experience */}
      <div className="mt-9 text-[9.5px]" style={{ fontFamily: RESUME_SERIF }}>
        Work Experience
      </div>
      <div className="mt-5 flex items-center gap-4 text-[9.5px] font-medium text-[#2B2B2B]">
        <span className="text-[15px] tracking-[-0.03em] text-[#111111]">Senior UX Developer</span>
        <span className="flex items-center gap-1 whitespace-nowrap">
          <span className="h-[10px] w-[10px] rounded-full bg-[#5B2EE0]" />
          Cyberdyne Systems
        </span>
        <MetaItem icon={Briefcase}>Contract</MetaItem>
        <MetaItem icon={MapPin}>Berlin</MetaItem>
      </div>
      <ul className="mt-3 list-disc space-y-[3px] pl-5 text-[10.5px] leading-[1.35] text-[#555555]">
        <li>Engineered responsive web applications with React and Node.js.</li>
        <li>Conducted A/B testing to optimize user engagement and conversion rates.</li>
        <li>Implemented accessibility standards to ensure inclusive design.</li>
        <li>Mentored junior developers in UX best practices and coding standards.</li>
        <li>Integrated third-party APIs to enhance application functionality.</li>
      </ul>

      <div className="mt-6 border-t border-[#EDEDED]" />
      <div className="mt-6 flex items-center justify-end gap-7 text-[9.5px] font-medium text-[#2B2B2B]">
        <MetaItem icon={Briefcase}>Full Time</MetaItem>
        <MetaItem icon={MapPin}>New York</MetaItem>
        <MetaItem icon={Calendar}>Jun 2022 – Feb 2023</MetaItem>
      </div>
      <ul className="mt-4 space-y-[3px] pl-[210px] text-[10.5px] leading-[1.35] text-[#9A9A9A]">
        <li>Built reusable components for web applications.</li>
        <li>Worked with cross-functional teams to deliver quality products.</li>
        <li>Reviewed code and provided constructive feedback.</li>
        <li>Maintained a design system for consistent UI patterns.</li>
      </ul>
      <div className="mt-8 flex items-center justify-end gap-7 text-[9.5px] font-medium text-[#B5B5B5]">
        <MetaItem icon={Briefcase}>Full Time</MetaItem>
        <MetaItem icon={MapPin}>London</MetaItem>
        <MetaItem icon={Calendar}>Jan 2024 – Present</MetaItem>
      </div>
    </div>

    {/* Avatar */}
    <div className="absolute right-[92px] top-0 flex h-[122px] w-[122px] items-center justify-center rounded-full border border-[#1456F0]/60 bg-[#FAFAFA]">
      <div
        className="flex h-[108px] w-[108px] items-center justify-center rounded-full bg-gradient-to-br from-[#3A3A3A] to-[#111111] text-[40px] text-white"
        style={{ fontFamily: RESUME_SERIF }}
      >
        AE
      </div>
    </div>

    {/* Inline formatting toolbar */}
    <div className="absolute left-[36px] top-[150px] flex items-center gap-2.5 rounded-md bg-white px-2 py-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.10)]">
      <span className="rounded bg-[#EDEDED] p-0.5">
        <Bold className="h-3.5 w-3.5" strokeWidth={2.5} />
      </span>
      <Italic className="h-3.5 w-3.5" strokeWidth={2.5} />
      <Underline className="h-3.5 w-3.5" strokeWidth={2.5} />
    </div>

    {/* Resume score card */}
    <div className="landing-float absolute right-[-48px] top-[250px] w-[214px] rounded-lg bg-white p-3.5 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold">Resume Score</span>
        <span className="flex items-center gap-1 text-[8.5px] text-[#8A8A8A]">
          <span className="h-[6px] w-[6px] rounded-full bg-[#E0483B]" />
          Action required
        </span>
      </div>
      <div className="mt-2.5 flex items-end justify-between">
        <div>
          <div className="h-[6px] w-[104px] rounded-full bg-[#EDEDED]" />
          <div className="mt-1.5 h-[6px] w-[104px] rounded-full bg-[#EDEDED]" />
          <div className="mt-1.5 h-[6px] w-[52px] rounded-full bg-[#EDEDED]" />
          <span
            className="mt-2.5 inline-flex items-center gap-1 rounded px-2 py-1 text-[9px] font-medium text-white"
            style={{ background: BLUE }}
          >
            <Sparkles className="h-2.5 w-2.5" />
            Optimize
          </span>
        </div>
        <div className="relative h-[66px] w-[66px]">
          <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
            <circle cx="18" cy="18" r="15" fill="none" stroke="#E8F6EE" strokeWidth="3" />
            <circle
              cx="18"
              cy="18"
              r="15"
              fill="none"
              stroke="#22A861"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${0.96 * 94.25} 94.25`}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[17px] font-semibold">96%</span>
        </div>
      </div>
    </div>

    {/* AI chat card */}
    <div className="absolute left-[-88px] top-[434px] w-[370px] rounded-lg bg-white p-4 shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-end gap-2.5">
        <span className="rounded-md bg-[#EEF3FF] px-3 py-1.5 text-[12.5px]" style={{ color: BLUE }}>
          Why is my resume weak?
        </span>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E3E3E3] text-[11px] font-semibold text-[#4A4A4A]">
          AE
        </span>
      </div>
      <div className="mt-3 flex items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F1F1F1]">
          <Sparkles className="h-4 w-4 text-[#4A4A4A]" />
        </span>
        <span className="rounded-md bg-[#F4F4F4] px-3 py-2 text-[12.5px] leading-[1.3]">
          Your experience was strong. The
          <br />
          wording wasn't. Fixed it.
        </span>
      </div>
      <div className="mt-3.5 flex items-center gap-2.5 rounded-md bg-[#F7F7F7] px-3 py-2.5 text-[12.5px] text-[#4A4A4A]">
        <Sparkles className="h-4 w-4" style={{ color: BLUE }} />
        Ask ResumeAI
      </div>
    </div>
  </div>
);

export default LandingPage;
