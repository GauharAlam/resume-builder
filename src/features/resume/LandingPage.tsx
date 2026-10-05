import React, { useEffect, useState } from "react";
import {
  Sparkles,
  ArrowRight,
  FileText,
  Check,
  Plus,
  Minus,
  Menu,
  X,
  PenLine,
  Crosshair,
  Star,
  Smile,
  Download,
  Share2,
  Undo2,
  Cloud,
  Wand2,
  Gauge,
  LayoutTemplate,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { trackEventOncePerSession } from "@/services/analytics";
import { useAuth } from "@/context";
import { setPostAuthRedirect } from "@/utils/authRedirect";
import { ResumeData, TemplateID } from "@/types";
import { ResumeTemplate, TEMPLATE_OPTIONS } from "@/components/templates";

const BLUE = "#2B5FD9";
const PAGE_BG = "#FFFFFF";
const SERIF = '"Source Serif 4", "Merriweather", Georgia, serif';

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Templates", href: "#templates" },
  { label: "FAQs", href: "#faqs" },
];

/* Sample content for the product previews on this page (not a real person) */
const SAMPLE_RESUME: ResumeData = {
  personalDetails: {
    fullName: "Maya Chen",
    jobTitle: "Product Designer",
    email: "maya.chen@email.com",
    phone: "+1 415 555 0134",
    location: "San Francisco, CA",
    links: [{ id: "l1", name: "Portfolio", url: "mayachen.design" }],
  },
  summary:
    "Product designer with five years of experience turning complex workflows into simple, accessible interfaces. Comfortable across research, interaction design and design systems, and happiest working closely with engineers.",
  experience: [
    {
      id: "e1",
      jobTitle: "Product Designer",
      company: "Northwind Labs",
      startDate: "Mar 2022",
      endDate: "Present",
      description:
        "• Redesigned the onboarding flow with research, prototypes and usability tests\n• Built and maintained a shared component library used by four product teams\n• Partnered with engineers to ship accessible, responsive interfaces",
    },
    {
      id: "e2",
      jobTitle: "UI Designer",
      company: "Brightside Studio",
      startDate: "Jun 2019",
      endDate: "Feb 2022",
      description:
        "• Designed marketing sites and dashboards for early-stage startups\n• Ran discovery workshops and turned findings into clear design briefs",
    },
  ],
  education: [
    { id: "ed1", degree: "BA in Interaction Design", institution: "California College of the Arts", startDate: "2015", endDate: "2019" },
  ],
  skills: "Figma, Prototyping, User Research, Design Systems, Accessibility, Usability Testing, HTML & CSS, Wireframing",
  projects: [
    { id: "p1", name: "Open Transit Map", description: "• Designed an open-source transit map focused on legibility for low-vision riders", url: "" },
  ],
  accomplishments: [
    { id: "a1", description: "Google UX Design Certificate" },
    { id: "a2", description: "Speaker, Bay Area Design Meetup" },
  ],
  sectionOrder: ["summary", "experience", "projects", "education", "skills", "accomplishments"],
  accentColor: "#1B1B1B",
  customization: { fontFamily: "inter", fontSize: "medium", layout: "standard" },
};

const BLUE_SAMPLE: ResumeData = { ...SAMPLE_RESUME, accentColor: BLUE };

const STEPS = [
  {
    title: "Bring your details",
    body: "Upload the resume you already have and we'll sort it into sections, import your LinkedIn profile, or fill in the builder from scratch.",
  },
  {
    title: "Sharpen it with AI",
    body: "Rewrite bullets, fix the tone, and tailor the wording to the job description you are applying for.",
  },
  {
    title: "Export and apply",
    body: "Download a text-based PDF that hiring software can read, an editable Word file, or share a public link.",
  },
];

const STARTERS = [
  { key: "software-engineer", starterTitle: "Software Engineer Starter", title: "Software Engineer", role: "Backend / Full Stack" },
  { key: "product-manager", starterTitle: "Product Manager Starter", title: "Product Manager", role: "B2B / SaaS" },
  { key: "ui-ux-designer", starterTitle: "UI/UX Designer Starter", title: "UI/UX Designer", role: "Product & Growth" },
];

const FAQS = [
  {
    q: "Can I use the resume I already have?",
    a: "Yes. Upload a PDF or Word file, or paste the text, and it is sorted into sections for you to review. Nothing is added or invented along the way.",
  },
  {
    q: "Do I need an account?",
    a: "Yes. A free account keeps your resumes saved and lets you pick up where you left off on any device. Signing up takes a few seconds.",
  },
  {
    q: "What can the AI help with?",
    a: "It can rewrite your summary and bullet points, draft bullets for a role, change the tone, suggest skills, score your resume, match it against a job description, and write a cover letter. You review every suggestion before it is applied.",
  },
  {
    q: "Will the AI make things up about me?",
    a: "It works from what you have written. Suggestions open in a review window where you can edit or reject them, so nothing reaches your resume without your approval.",
  },
  {
    q: "Which formats can I export?",
    a: "PDF and Word (DOCX). The PDF contains real, selectable text rather than a picture of the page, so applicant tracking systems can read it.",
  },
  {
    q: "Are the templates ATS-friendly?",
    a: "Yes. The templates use clean, text-based layouts that applicant tracking systems can parse, and the ATS analysis points out missing keywords.",
  },
  {
    q: "Can I share my resume with a link?",
    a: "Yes. Turn on sharing for a resume and send its public link. You can turn it off again at any time.",
  },
];

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const currentYear = new Date().getFullYear();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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

  /* The editor needs an account: guests sign up first, then land in a new resume */
  const goToNewResume = () => {
    if (isAuthenticated) {
      navigate("/try");
      return;
    }
    setPostAuthRedirect("/try");
    navigate("/register");
  };

  const handleStart = () => {
    if (isAuthenticated) {
      navigate("/history");
      return;
    }
    goToNewResume();
  };

  const handleStarterSelect = (starterKey: string, starterTitle: string) => {
    localStorage.setItem("starter_resume_key", starterKey);
    localStorage.setItem("starter_resume_title", starterTitle);
    goToNewResume();
  };

  const handleTemplateSelect = (templateId: TemplateID) => {
    localStorage.setItem("starter_template", templateId);
    goToNewResume();
  };

  const primaryLabel = isAuthenticated ? "Go to my resumes" : "Create my resume";

  return (
    <div className="min-h-screen overflow-x-hidden font-inter text-[#14161A] antialiased" style={{ background: PAGE_BG }}>
      <style>{`
        html { scroll-behavior: smooth; }
        @keyframes landingFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
        .landing-float { animation: landingFloat 6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          html { scroll-behavior: auto; }
          .landing-float { animation: none; }
        }
      `}</style>

      {/* ── NAV ─────────────────────────────────────────────── */}
      <header
        className={`sticky top-0 z-50 transition-[background-color,box-shadow,border-color] duration-200 ${
          scrolled || menuOpen ? "border-b border-[#E9EAEE] bg-white/85 backdrop-blur-md" : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between px-5 sm:px-8">
          <a href="/" className="flex items-center gap-2.5" aria-label="ResumeAI home">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: BLUE }}>
              <FileText className="h-4 w-4 text-white" strokeWidth={2.5} />
            </span>
            <span className="text-xl font-semibold tracking-tight">ResumeAI</span>
          </a>

          <nav className="hidden items-center gap-8 text-[15px] text-[#5B6270] md:flex" aria-label="Main">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="transition-colors hover:text-[#14161A]">
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {!isAuthenticated && (
              <button
                onClick={() => navigate("/login")}
                className="hidden rounded-xl px-4 py-2.5 text-[15px] font-medium text-[#14161A] transition-colors hover:bg-[#F3F4F6] sm:block"
              >
                Sign in
              </button>
            )}
            <button
              onClick={handleStart}
              className="rounded-xl px-4 py-2.5 text-[15px] font-medium text-white shadow-[0_1px_2px_rgba(16,24,40,0.12)] transition-colors hover:bg-[#2450BD]"
              style={{ background: BLUE }}
            >
              {primaryLabel}
            </button>
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              className="rounded-xl p-2.5 text-[#14161A] hover:bg-[#F3F4F6] md:hidden"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="border-t border-[#E9EAEE] px-5 pb-4 pt-2 md:hidden" aria-label="Mobile">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-3 py-3 text-[15px] font-medium text-[#14161A] hover:bg-[#F3F4F6]"
              >
                {link.label}
              </a>
            ))}
            {!isAuthenticated && (
              <button
                onClick={() => navigate("/login")}
                className="block w-full rounded-lg px-3 py-3 text-left text-[15px] font-medium text-[#14161A] hover:bg-[#F3F4F6] sm:hidden"
              >
                Sign in
              </button>
            )}
          </nav>
        )}
      </header>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="relative -mt-16 overflow-hidden pt-16">
        {/* Backdrop: soft glow + dotted grid */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div
            className="absolute inset-x-0 top-0 h-[720px]"
            style={{
              background:
                "radial-gradient(60% 55% at 50% 0%, rgba(43,95,217,0.16) 0%, rgba(43,95,217,0.05) 45%, rgba(255,255,255,0) 100%)",
            }}
          />
          <div
            className="absolute inset-x-0 top-0 h-[620px]"
            style={{
              backgroundImage: "radial-gradient(rgba(20,22,26,0.10) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
              maskImage: "radial-gradient(ellipse 60% 70% at 50% 20%, #000 20%, transparent 85%)",
              WebkitMaskImage: "radial-gradient(ellipse 60% 70% at 50% 20%, #000 20%, transparent 85%)",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-[1240px] px-5 pt-14 text-center sm:px-8 sm:pt-20">
          <div
            className="animate-fade-rise inline-flex items-center gap-2 rounded-full border border-[#D9E2F8] bg-white/80 py-1.5 pl-2 pr-3.5 text-sm text-[#3F4551] shadow-[0_1px_2px_rgba(16,24,40,0.05)]"
            style={{ animationDelay: "0ms" }}
          >
            <span className="flex items-center gap-1 rounded-full bg-[#EEF3FF] px-2 py-0.5 text-xs font-semibold" style={{ color: BLUE }}>
              <Sparkles size={12} />
              AI
            </span>
            Resume builder · Free to get started
          </div>

          <h1
            className="animate-fade-rise mx-auto mt-6 leading-[1.04]"
            style={{
              animationDelay: "100ms",
              fontFamily: SERIF,
              fontSize: "clamp(2rem, 6.2vw, 4.6rem)",
              letterSpacing: "-0.045em",
            }}
          >
            <span className="block text-[#7A808C]">Stop struggling with resumes.</span>
            <span className="block">Let AI do the hard part.</span>
          </h1>

          <p
            className="animate-fade-rise mx-auto mt-6 max-w-[36rem] text-[1.08rem] leading-[1.65] text-[#5B6270] sm:text-[1.18rem]"
            style={{ animationDelay: "200ms" }}
          >
            Write, polish and tailor your resume in one place. Pick a template, let AI tighten the wording, and
            download a resume that is ready to send.
          </p>

          <div className="animate-fade-rise mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row" style={{ animationDelay: "300ms" }}>
            <button
              onClick={handleStart}
              className="group flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-base font-medium text-white shadow-[0_8px_24px_rgba(43,95,217,0.28)] transition-[background-color,transform] hover:bg-[#2450BD] active:scale-[0.98] sm:w-auto"
              style={{ background: BLUE }}
            >
              {isAuthenticated ? primaryLabel : "Create my resume — it's free"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <a
              href="#templates"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#E3E5EA] bg-white px-6 py-3.5 text-base font-medium text-[#14161A] shadow-[0_1px_2px_rgba(16,24,40,0.05)] transition-colors hover:bg-[#F6F7F9] sm:w-auto"
            >
              <LayoutTemplate className="h-4 w-4" />
              Browse templates
            </a>
          </div>

          <ul
            className="animate-fade-rise mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-[#5B6270]"
            style={{ animationDelay: "400ms" }}
          >
            {["Upload your existing resume", "ATS-readable PDF and DOCX", "No design skills needed"].map((item) => (
              <li key={item} className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-[#16A34A]" strokeWidth={2.5} />
                {item}
              </li>
            ))}
          </ul>

          <HeroEditorPreview />
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────── */}
      <section id="how-it-works" className="mx-auto max-w-[1240px] scroll-mt-20 px-5 pt-24 sm:px-8 sm:pt-32">
        <SectionHeading eyebrow="How it works" title="From blank page to sent, in three steps" center />
        <ol className="mt-12 grid gap-5 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className="reveal relative rounded-2xl border border-[#E9EAEE] bg-white p-7"
              style={{ transitionDelay: `${i * 90}ms` }}
            >
              <span
                className="flex h-10 w-10 items-center justify-center rounded-xl text-[15px] font-semibold text-white"
                style={{ background: BLUE }}
              >
                {i + 1}
              </span>
              <h3 className="mt-5 text-lg font-semibold tracking-tight">{step.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-[#5B6270]">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ── FEATURES (bento) ────────────────────────────────── */}
      <section id="features" className="mx-auto max-w-[1240px] scroll-mt-20 px-5 pt-24 sm:px-8 sm:pt-32">
        <SectionHeading
          eyebrow="Features"
          title="Everything you need to get shortlisted"
          subtitle="The writing help, the checks recruiters' software runs, and the formatting, handled in one editor."
          center
        />

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {/* AI rewrite — interactive before/after */}
          <BentoCard className="lg:col-span-2" icon={Wand2} title="AI that rewrites, not replaces" body="Select any text and ask for a rewrite, a clearer version, or a different tone. You approve every change.">
            <RewriteDemo />
          </BentoCard>

          {/* ATS score */}
          <BentoCard icon={Gauge} title="Know your ATS score" body="See how your resume reads to applicant tracking systems, with specific fixes.">
            <div className="flex items-center gap-5 rounded-xl bg-[#F6F7F9] p-5">
              <ScoreRing value={86} />
              <ul className="space-y-2 text-[13px] text-[#3F4551]">
                {["Clear section headings", "Readable by parsers", "Add 2 missing keywords"].map((item, i) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 rounded-full ${i === 2 ? "bg-[#F59E0B]" : "bg-[#16A34A]"}`} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-2 text-xs text-[#9AA0AB]">Example result</p>
          </BentoCard>

          {/* JD match */}
          <BentoCard icon={Crosshair} title="Match the job description" body="Paste a posting to see which skills you cover and which are missing.">
            <div className="rounded-xl bg-[#F6F7F9] p-5">
              <div className="flex flex-wrap gap-1.5">
                {["Figma", "Prototyping", "User research"].map((skill) => (
                  <span key={skill} className="inline-flex items-center gap-1 rounded-md bg-[#E7F6EC] px-2 py-1 text-xs font-medium text-[#15803D]">
                    <Check size={12} strokeWidth={3} />
                    {skill}
                  </span>
                ))}
                {["Design systems", "A/B testing"].map((skill) => (
                  <span key={skill} className="inline-flex items-center gap-1 rounded-md border border-dashed border-[#F1B66A] bg-[#FEF6E7] px-2 py-1 text-xs font-medium text-[#B45309]">
                    <Plus size={12} strokeWidth={3} />
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <p className="mt-2 text-xs text-[#9AA0AB]">Example result</p>
          </BentoCard>

          {/* Design controls */}
          <BentoCard icon={LayoutTemplate} title="Looks good without the fiddling" body="Switch templates, fonts, colours and spacing in a click. The page re-flows itself.">
            <div className="flex items-center justify-between rounded-xl bg-[#F6F7F9] p-5">
              <div className="flex gap-2">
                {["#1B1B1B", BLUE, "#059669", "#E11D48", "#F59E0B"].map((color, i) => (
                  <span
                    key={color}
                    className={`h-7 w-7 rounded-lg border border-black/10 ${i === 1 ? "ring-2 ring-[#2B5FD9] ring-offset-2 ring-offset-[#F6F7F9]" : ""}`}
                    style={{ background: color }}
                  />
                ))}
              </div>
              <span className="rounded-lg border border-[#E3E5EA] bg-white px-2.5 py-1.5 text-xs font-medium text-[#14161A]">Inter</span>
            </div>
          </BentoCard>

          {/* Export / autosave */}
          <BentoCard icon={ShieldCheck} title="Saved, exportable, shareable" body="Autosave with undo and redo, PDF and DOCX downloads, and a public link when you need one.">
            <div className="grid grid-cols-3 gap-2 rounded-xl bg-[#F6F7F9] p-5 text-center text-xs font-medium text-[#3F4551]">
              {[
                { icon: Cloud, label: "Autosave" },
                { icon: Download, label: "PDF · DOCX" },
                { icon: Share2, label: "Share link" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="rounded-lg bg-white px-2 py-3 shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
                  <Icon className="mx-auto mb-1.5 h-4 w-4" style={{ color: BLUE }} />
                  {label}
                </div>
              ))}
            </div>
          </BentoCard>
        </div>
      </section>

      {/* ── TEMPLATES ───────────────────────────────────────── */}
      <section id="templates" className="scroll-mt-20 pt-24 sm:pt-32">
        <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
          <SectionHeading
            eyebrow="Templates"
            title="Pick a look. Change it any time."
            subtitle="Every template is ATS-friendly, and switching never loses your content."
            center
          />
        </div>

        {/* Real templates rendered with sample content; scrolls sideways on small screens */}
        <div className="mt-12 overflow-x-auto pb-6" style={{ scrollbarWidth: "none" }}>
          <ul className="mx-auto flex w-max snap-x gap-5 px-5 sm:px-8">
            {TEMPLATE_OPTIONS.map((option, i) => (
              <li key={option.id} className="reveal w-[232px] shrink-0 snap-start" style={{ transitionDelay: `${i * 70}ms` }}>
                <button
                  type="button"
                  onClick={() => handleTemplateSelect(option.id)}
                  className="group block w-full text-left"
                  aria-label={`Use the ${option.name} template`}
                >
                  <div className="relative h-[328px] overflow-hidden rounded-xl border border-[#E9EAEE] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05)] transition-[box-shadow,transform] duration-200 group-hover:-translate-y-1 group-hover:shadow-[0_18px_40px_rgba(16,24,40,0.12)]">
                    <div className="pointer-events-none select-none" style={{ width: 794, zoom: 232 / 794 }} aria-hidden="true">
                      <ResumeTemplate template={option.id} data={option.supportsAccent && option.id !== "clean-serif" ? BLUE_SAMPLE : SAMPLE_RESUME} />
                    </div>
                    <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-[#14161A]/55 via-transparent to-transparent p-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
                      <span className="flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-2 text-sm font-medium text-[#14161A] shadow-lg">
                        Use this template
                        <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 px-1">
                    <div className="text-[15px] font-semibold">{option.name}</div>
                    <div className="mt-0.5 text-sm text-[#5B6270]">{option.description}</div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Role-based starters */}
        <div className="mx-auto mt-10 max-w-[1240px] px-5 sm:px-8">
          <div className="reveal rounded-2xl border border-[#E9EAEE] bg-[#F6F7F9] p-6 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-sm">
                <h3 className="text-lg font-semibold tracking-tight">Rather not start from scratch?</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-[#5B6270]">
                  Open a pre-filled example for your role and replace the details with your own.
                </p>
              </div>
              <div className="grid flex-1 gap-3 sm:grid-cols-3 lg:max-w-[720px]">
                {STARTERS.map((starter) => (
                  <button
                    key={starter.key}
                    type="button"
                    onClick={() => handleStarterSelect(starter.key, starter.starterTitle)}
                    className="group flex items-center justify-between gap-3 rounded-xl border border-[#E3E5EA] bg-white px-4 py-3.5 text-left transition-colors hover:border-[#2B5FD9]"
                  >
                    <span>
                      <span className="block text-[15px] font-medium">{starter.title}</span>
                      <span className="block text-xs text-[#6B7280]">{starter.role}</span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-[#9AA0AB] transition-[color,transform] group-hover:translate-x-0.5 group-hover:text-[#2B5FD9]" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQS ────────────────────────────────────────────── */}
      <section id="faqs" className="mx-auto grid max-w-[1240px] scroll-mt-20 gap-10 px-5 pt-24 sm:px-8 sm:pt-32 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div>
          <SectionHeading eyebrow="FAQs" title="Questions, answered" subtitle="The short version of what people ask before they start." />
        </div>
        <div className="border-t border-[#E3E5EA]">
          {FAQS.map((faq, i) => (
            <FaqItem key={faq.q} question={faq.q} answer={faq.a} defaultOpen={i === 0} />
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────── */}
      <section className="mx-auto max-w-[1240px] px-5 pt-24 sm:px-8 sm:pt-32">
        <div
          className="reveal relative overflow-hidden rounded-3xl px-6 py-16 text-center text-white sm:py-20"
          style={{ background: "linear-gradient(135deg, #1E47B0 0%, #2B5FD9 55%, #4F82F2 100%)" }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            aria-hidden="true"
            style={{
              backgroundImage: "radial-gradient(rgba(255,255,255,0.35) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
              maskImage: "radial-gradient(ellipse 70% 80% at 50% 0%, #000 0%, transparent 75%)",
              WebkitMaskImage: "radial-gradient(ellipse 70% 80% at 50% 0%, #000 0%, transparent 75%)",
            }}
          />
          <h2
            className="relative mx-auto max-w-2xl leading-[1.08]"
            style={{ fontFamily: SERIF, fontSize: "clamp(2rem, 4.4vw, 3.3rem)", letterSpacing: "-0.04em" }}
          >
            Your next role starts with a better resume.
          </h2>
          <p className="relative mx-auto mt-5 max-w-md text-[1.05rem] leading-relaxed text-white/80">
            Start free, pick a template, and let AI help you say it well.
          </p>
          <button
            onClick={handleStart}
            className="group relative mt-9 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-base font-medium text-[#14161A] shadow-[0_10px_30px_rgba(8,20,60,0.25)] transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
          >
            {primaryLabel}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer className="mx-auto mt-20 max-w-[1240px] px-5 sm:px-8">
        <div className="flex flex-col items-center justify-between gap-5 border-t border-[#E9EAEE] py-8 text-sm text-[#6B7280] sm:flex-row">
          <div className="flex items-center gap-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-md" style={{ background: BLUE }}>
              <FileText className="h-3 w-3 text-white" strokeWidth={2.5} />
            </span>
            <span>© {currentYear} ResumeAI. All rights reserved.</span>
          </div>
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2" aria-label="Footer">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="transition-colors hover:text-[#14161A]">
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
═══════════════════════════════════════════════════════════════ */

const SectionHeading: React.FC<{ eyebrow: string; title: string; subtitle?: string; center?: boolean }> = ({
  eyebrow,
  title,
  subtitle,
  center,
}) => (
  <div className={`reveal ${center ? "mx-auto max-w-3xl text-center" : "max-w-xl"}`}>
    <span className="text-sm font-semibold uppercase tracking-[0.08em]" style={{ color: BLUE }}>
      {eyebrow}
    </span>
    <h2
      className="mt-3 leading-[1.08]"
      style={{ fontFamily: SERIF, fontSize: "clamp(1.9rem, 3.6vw, 2.9rem)", letterSpacing: "-0.04em" }}
    >
      {title}
    </h2>
    {subtitle && <p className={`mt-4 text-[1.05rem] leading-relaxed text-[#5B6270] ${center ? "mx-auto max-w-xl" : ""}`}>{subtitle}</p>}
  </div>
);

const BentoCard: React.FC<{
  icon: React.ElementType;
  title: string;
  body: string;
  className?: string;
  children: React.ReactNode;
}> = ({ icon: Icon, title, body, className = "", children }) => (
  <div
    className={`reveal flex flex-col rounded-2xl border border-[#E9EAEE] bg-white p-6 transition-shadow hover:shadow-[0_14px_40px_rgba(16,24,40,0.07)] sm:p-7 ${className}`}
  >
    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF3FF]">
      <Icon className="h-5 w-5" style={{ color: BLUE }} />
    </span>
    <h3 className="mt-5 text-lg font-semibold tracking-tight">{title}</h3>
    <p className="mt-2 text-[15px] leading-relaxed text-[#5B6270]">{body}</p>
    <div className="mt-6 flex flex-1 flex-col justify-end">{children}</div>
  </div>
);

const ScoreRing: React.FC<{ value: number }> = ({ value }) => {
  const circumference = 2 * Math.PI * 15;
  return (
    <div className="relative h-[84px] w-[84px] shrink-0">
      <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
        <circle cx="18" cy="18" r="15" fill="none" stroke="#DDF3E5" strokeWidth="3.2" />
        <circle
          cx="18"
          cy="18"
          r="15"
          fill="none"
          stroke="#16A34A"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeDasharray={`${(value / 100) * circumference} ${circumference}`}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xl font-semibold">{value}</span>
    </div>
  );
};

/* Before/after example of an AI rewrite. Illustrative text only. */
const RewriteDemo: React.FC = () => {
  const [view, setView] = useState<"before" | "after">("after");
  const isAfter = view === "after";
  return (
    <div className="rounded-xl bg-[#F6F7F9] p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="grid grid-cols-2 gap-1 rounded-lg bg-white p-1 shadow-[0_1px_2px_rgba(16,24,40,0.06)]" role="tablist" aria-label="Rewrite example">
          {(["before", "after"] as const).map((v) => (
            <button
              key={v}
              role="tab"
              aria-selected={view === v}
              onClick={() => setView(v)}
              className={`rounded-md px-3.5 py-1.5 text-sm font-medium capitalize transition-colors ${
                view === v ? "bg-[#2B5FD9] text-white" : "text-[#5B6270] hover:text-[#14161A]"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
        <span className="text-xs text-[#9AA0AB]">Example</span>
      </div>
      <div
        className={`mt-4 rounded-lg border bg-white p-4 text-[15px] leading-relaxed transition-colors ${
          isAfter ? "border-[#C9D8FB]" : "border-[#E3E5EA]"
        }`}
      >
        <div className="mb-2 flex items-center gap-1.5 text-xs font-medium" style={{ color: isAfter ? BLUE : "#6B7280" }}>
          {isAfter ? <Sparkles size={13} /> : <PenLine size={13} />}
          {isAfter ? "Rewritten with AI" : "Your draft"}
        </div>
        <ul className="list-disc space-y-1.5 pl-5 text-[#14161A]">
          {(isAfter
            ? [
                "Designed responsive landing pages in Figma and partnered with engineers to ship the website redesign.",
                "Ran usability tests with customers and turned the findings into prioritised design improvements.",
              ]
            : ["Responsible for making designs for the website and helping the team.", "Did some user testing and gave feedback."]
          ).map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const FaqItem: React.FC<{ question: string; answer: string; defaultOpen?: boolean }> = ({ question, answer, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[#E3E5EA]">
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-6 py-5 text-left text-[1.05rem] font-medium transition-colors hover:text-[#2B5FD9]"
      >
        {question}
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F3F4F6] text-[#3F4551]">
          {open ? <Minus size={15} /> : <Plus size={15} />}
        </span>
      </button>
      {open && <p className="pb-6 pr-12 text-[15px] leading-relaxed text-[#5B6270]">{answer}</p>}
    </div>
  );
};

/* ── Hero: a non-interactive preview of the real editor ────── */

const MockBarButton: React.FC<{ icon: React.ReactNode; children: React.ReactNode }> = ({ icon, children }) => (
  <span className="inline-flex items-center gap-1.5 whitespace-nowrap px-2 py-1 text-[12px] font-medium text-[#14161A]">
    {icon}
    {children}
  </span>
);

const HeroEditorPreview: React.FC = () => {
  const divider = <span className="h-3.5 w-px bg-[#E3E5EA]" />;
  return (
    <div
      className="animate-fade-rise relative mx-auto mt-14 max-w-[1120px] select-none text-left sm:mt-16"
      style={{ animationDelay: "500ms" }}
      aria-hidden="true"
      // Decorative: keep it out of the tab order as well as the accessibility tree
      {...({ inert: "" } as Record<string, string>)}
    >
      {/* Glow under the frame */}
      <div
        className="absolute -inset-x-6 -bottom-6 top-10 rounded-[32px] opacity-70 blur-2xl"
        style={{ background: "linear-gradient(180deg, rgba(43,95,217,0.22), rgba(43,95,217,0))" }}
      />

      <div
        className="pointer-events-none relative overflow-hidden rounded-t-2xl border border-b-0 border-[#DCE0E8] bg-white shadow-[0_30px_80px_rgba(16,24,40,0.14)]"
        style={{
          maskImage: "linear-gradient(to bottom, #000 78%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, #000 78%, transparent 100%)",
        }}
      >
        {/* Document bar */}
        <div className="flex h-12 items-center justify-between gap-3 border-b border-[#E9EAEE] px-4">
          <div className="flex items-center gap-3 text-[#6B7280]">
            <Undo2 size={15} />
            <span className="hidden items-center gap-1.5 text-xs italic sm:flex">
              <Cloud size={14} />
              Saved just now
            </span>
          </div>
          <span className="truncate text-sm font-medium text-[#14161A]">Maya Chen Resume</span>
          <div className="flex items-center gap-1.5">
            <span className="hidden items-center gap-1.5 rounded-lg border border-[#E3E5EA] px-2.5 py-1.5 text-xs font-medium sm:flex">
              <Sparkles size={13} style={{ color: BLUE }} />
              Analyze
            </span>
            <span className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-white" style={{ background: BLUE }}>
              <Share2 size={13} />
              Share
            </span>
          </div>
        </div>

        <div className="grid h-[400px] grid-cols-1 gap-4 bg-[#F3F4F6] p-4 sm:h-[520px] lg:grid-cols-[230px_minmax(0,1fr)_240px]">
          {/* Builder panel */}
          <div className="hidden overflow-hidden rounded-xl border border-[#E9EAEE] bg-white lg:block">
            <div className="border-b border-[#E9EAEE] p-3">
              <div className="grid grid-cols-2 gap-1 rounded-lg bg-[#F3F4F6] p-1 text-center text-xs font-medium">
                <span className="rounded-md bg-white py-1.5 shadow-[0_1px_2px_rgba(16,24,40,0.08)]">Builder</span>
                <span className="py-1.5 text-[#6B7280]">Templates</span>
              </div>
            </div>
            <div className="border-b border-[#E9EAEE] p-3">
              <div className="flex items-center justify-between text-[13px] font-medium">
                Professional Summary
                <Minus size={14} />
              </div>
              <div className="mt-2.5 space-y-1.5 rounded-lg border border-[#E3E5EA] p-2.5">
                {[100, 92, 96, 60].map((w, i) => (
                  <div key={i} className="h-1.5 rounded-full bg-[#E9EAEE]" style={{ width: `${w}%` }} />
                ))}
              </div>
              <div className="mt-2.5 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium text-white" style={{ background: BLUE }}>
                <Sparkles size={12} />
                Improve my summary
              </div>
            </div>
            {["Education", "Work Experience", "Projects", "Certification", "Contacts", "Skills"].map((section) => (
              <div key={section} className="flex items-center justify-between border-b border-[#E9EAEE] px-3 py-3 text-[13px] font-medium last:border-b-0">
                {section}
                <Plus size={14} />
              </div>
            ))}
          </div>

          {/* The real Clean Serif template, with the summary selected */}
          <div className="flex justify-center overflow-hidden">
            <div className="h-max shrink-0 bg-white shadow-[0_2px_24px_rgba(16,24,40,0.07)] [zoom:0.4] sm:[zoom:0.7] lg:[zoom:0.6] xl:[zoom:0.76]" style={{ width: 794 }}>
              <ResumeTemplate
                template="clean-serif"
                data={SAMPLE_RESUME}
                interaction={{
                  selected: "summary",
                  onSelect: () => {},
                  onEdit: () => {},
                  renderActions: () => (
                    <div
                      className="flex items-center gap-0.5 rounded-xl border border-[#E9EAEE] bg-white px-1.5 py-1 font-inter shadow-[0_8px_28px_rgba(16,24,40,0.14)]"
                      style={{ zoom: 1.3 }}
                    >
                      <MockBarButton icon={<PenLine size={13} />}>Rewrite</MockBarButton>
                      {divider}
                      <MockBarButton icon={<Crosshair size={13} />}>Match Job Description</MockBarButton>
                      {divider}
                      <MockBarButton icon={<Star size={13} />}>Improve Clarity</MockBarButton>
                      {divider}
                      <MockBarButton icon={<Smile size={13} />}>Change Tone</MockBarButton>
                    </div>
                  ),
                }}
              />
            </div>
          </div>

          {/* Inspector */}
          <div className="hidden flex-col gap-4 lg:flex">
            <div className="rounded-xl border border-[#E4EAFB] p-4" style={{ background: "linear-gradient(160deg, #F7F9FF 0%, #E9EFFD 100%)" }}>
              <div className="flex items-center justify-between">
                <Sparkles size={15} style={{ color: BLUE }} fill={BLUE} />
                <span className="text-xs text-[#14161A]">1/4</span>
              </div>
              <div className="mt-2.5 text-sm font-medium">Skill Alignment</div>
              <p className="mt-1 text-xs leading-relaxed text-[#6B7280]">3 skills found in your profile that are not listed here.</p>
              <div className="mt-3 grid grid-cols-2 gap-1.5 text-center text-xs font-medium">
                <span className="rounded-lg border border-[#E3E5EA] bg-white py-2">Ignore</span>
                <span className="rounded-lg py-2 text-white" style={{ background: BLUE }}>
                  Add skills
                </span>
              </div>
            </div>
            <div className="flex-1 rounded-xl border border-[#E9EAEE] bg-white p-4">
              <div className="text-sm font-medium">Text</div>
              <div className="mt-3 flex items-center justify-between rounded-lg border border-[#E3E5EA] px-2.5 py-2 text-xs">
                Inter
                <span className="text-[#9AA0AB]">▾</span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                <span className="rounded-lg border border-[#E3E5EA] px-2.5 py-2">100%</span>
                <span className="rounded-lg border border-[#E3E5EA] px-2.5 py-2">1.6</span>
              </div>
              <div className="mt-4 text-sm font-medium">Colors</div>
              <div className="mt-3 flex gap-1.5">
                {["#1B1B1B", BLUE, "#059669", "#F59E0B", "#E11D48"].map((color, i) => (
                  <span
                    key={color}
                    className={`h-6 w-6 rounded-md border border-black/10 ${i === 0 ? "ring-2 ring-[#2B5FD9] ring-offset-1" : ""}`}
                    style={{ background: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating callouts */}
      <div className="landing-float absolute -left-[150px] top-[46%] hidden items-center gap-2.5 rounded-xl border border-[#E9EAEE] bg-white px-3.5 py-2.5 shadow-[0_12px_32px_rgba(16,24,40,0.12)] min-[1440px]:flex">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E7F6EC]">
          <Check className="h-4 w-4 text-[#16A34A]" strokeWidth={3} />
        </span>
        <span className="text-[13px] font-medium leading-tight">
          ATS-friendly
          <span className="block text-xs font-normal text-[#6B7280]">Clean, parseable layout</span>
        </span>
      </div>
      <div
        className="landing-float absolute -right-[130px] top-[16%] hidden items-center gap-2.5 rounded-xl border border-[#E9EAEE] bg-white px-3.5 py-2.5 shadow-[0_12px_32px_rgba(16,24,40,0.12)] min-[1440px]:flex"
        style={{ animationDelay: "2s" }}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EEF3FF]">
          <Download className="h-4 w-4" style={{ color: BLUE }} />
        </span>
        <span className="text-[13px] font-medium leading-tight">
          Export ready
          <span className="block text-xs font-normal text-[#6B7280]">PDF and DOCX</span>
        </span>
      </div>
    </div>
  );
};

export default LandingPage;
