import React, { useEffect } from "react";
import {
  Sparkles,
  Zap,
  FileText,
  ArrowRight,
  Users,
  Briefcase,
  BarChart3,
  CheckCircle2,
  Target,
  Shield,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { trackEventOncePerSession } from "@/services/analytics";
import { useAuth } from "@/context";

/* ─── Colour tokens (match app.css / proposal) ──────────────── */
const C = {
  base: "#0D1512",
  textPrimary: "#F0FDF4",
  textSecondary: "rgba(209,250,229,0.65)",
  textMuted: "rgba(209,250,229,0.42)",
  green: "#4ade80",
  greenDeep: "#22c55e",
  greenMuted: "rgba(74,222,128,0.12)",
  greenBorder: "rgba(74,222,128,0.25)",
  mint: "#bbf7d0",
  mintMuted: "rgba(187,247,208,0.10)",
  mintBorder: "rgba(187,247,208,0.22)",
  surfaceBorder: "rgba(255,255,255,0.08)",
  divider: "rgba(255,255,255,0.06)",
} as const;

/* ─── Helper: stagger delay style ───────────────────────────── */
const delay = (ms: number): React.CSSProperties => ({
  animationDelay: `${ms}ms`,
});

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const currentYear = new Date().getFullYear();

  /* Analytics */
  useEffect(() => {
    trackEventOncePerSession("funnel_visit_home", "visit_home");
  }, []);

  /* Scroll-reveal: one IntersectionObserver for all .reveal elements */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in-view");
            observer.unobserve(e.target); // one-shot
          }
        }),
      { threshold: 0.1 },
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  /* Starter select — logic identical to original */
  const handleStarterSelect = (starterKey: string, starterTitle: string) => {
    localStorage.setItem("starter_resume_key", starterKey);
    localStorage.setItem("starter_resume_title", starterTitle);
    navigate("/register");
  };

  return (
    <div
      className="min-h-screen relative overflow-x-hidden font-sans"
      style={
        {
          background: C.base,
          color: C.textPrimary,
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        } as React.CSSProperties
      }
    >
      {/* ════════════════════════════════════════════════════════
          AMBIENT BACKGROUND — slow-moving green blobs
      ════════════════════════════════════════════════════════ */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        {/* Top-left warm blob */}
        <div
          className="absolute animate-blob"
          style={{
            top: "-18%",
            left: "-12%",
            width: "55vw",
            height: "55vw",
            borderRadius: "50%",
            background: "#16532d",
            opacity: 0.38,
            filter: "blur(100px)",
          }}
        />
        {/* Bottom-right cool blob */}
        <div
          className="absolute animate-blob animation-delay-2000"
          style={{
            bottom: "5%",
            right: "-18%",
            width: "48vw",
            height: "48vw",
            borderRadius: "50%",
            background: "#134e3e",
            opacity: 0.28,
            filter: "blur(120px)",
          }}
        />
        {/* Mid-page accent */}
        <div
          className="absolute animate-blob animation-delay-4000"
          style={{
            top: "48%",
            left: "38%",
            width: "32vw",
            height: "32vw",
            borderRadius: "50%",
            background: "#052e16",
            opacity: 0.22,
            filter: "blur(80px)",
          }}
        />
      </div>

      {/* ════════════════════════════════════════════════════════
          NAV — fixed floating glass pill
          Outer div: fixed full-width, transparent, pointer-events-none
          so clicks pass through the empty gaps on left and right.
          Inner nav: the actual pill, pointer-events-auto.
      ════════════════════════════════════════════════════════ */}
      <div
        className="fixed top-0 left-0 right-0 z-50 flex justify-center"
        style={{ padding: "20px 12px 0", pointerEvents: "none" }}
      >
        <nav
          className="glass-pill-nav w-full flex items-center justify-between"
          style={{
            maxWidth: "960px",
            padding: "8px 10px 8px 22px",
            pointerEvents: "auto",
          }}
        >
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: C.greenMuted,
                border: `1px solid ${C.greenBorder}`,
              }}
            >
              <FileText className="w-4 h-4" style={{ color: C.green }} />
            </div>
            <span
              className="text-base font-bold tracking-tight"
              style={{ color: C.textPrimary }}
            >
              ResumeAI
            </span>
          </div>

          {/* Nav actions */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <button
                onClick={() => navigate("/history")}
                className="btn-primary text-sm px-5 py-2 rounded-full"
              >
                Go to Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="text-sm font-medium px-4 py-2 rounded-full transition-colors"
                  style={{ color: C.textSecondary }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = C.textPrimary)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = C.textSecondary)
                  }
                >
                  Log in
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="btn-primary text-sm px-5 py-2 rounded-full"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </nav>
      </div>

      {/* ════════════════════════════════════════════════════════
          HERO — staggered entrance animation
      ════════════════════════════════════════════════════════ */}
      <section className="relative z-10 flex flex-col items-center text-center px-4 sm:px-6 pt-28 pb-16">
        {/* Badge */}
        <div
          className="animate-fade-rise inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-sm font-semibold"
          style={{
            ...delay(0),
            background: C.greenMuted,
            border: `1px solid ${C.greenBorder}`,
            color: C.green,
          }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>The modern standard for resumes</span>
        </div>

        {/* ── HEADLINE — Playfair Display, green italic accent ── */}
        <h1
          className="animate-fade-rise font-playfair font-bold leading-[1.12] mb-6 max-w-4xl"
          style={{
            ...delay(150),
            fontSize: "clamp(2.8rem, 7vw, 4.75rem)",
            letterSpacing: "-0.025em",
            color: C.textPrimary,
          }}
        >
          Build a resume that
          <br />
          <em
            className="not-italic italic"
            style={{
              color: C.green,
              /* Signature glow — the "green exhale" moment */
              textShadow: "0 0 48px rgba(74,222,128,0.38)",
            }}
          >
            opens doors.
          </em>
        </h1>

        {/* Subtext */}
        <p
          className="animate-fade-rise text-lg sm:text-xl max-w-2xl leading-relaxed mb-10"
          style={{
            ...delay(310),
            color: C.textSecondary,
          }}
        >
          Create an ATS-friendly, beautifully designed resume in minutes. Stand
          out to employers without the hassle of formatting documents.
        </p>

        {/* CTA buttons */}
        <div
          className="animate-fade-rise flex flex-col sm:flex-row items-center gap-3 mb-16"
          style={delay(460)}
        >
          <button
            onClick={() => navigate(isAuthenticated ? "/history" : "/register")}
            className="btn-primary flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm w-full sm:w-auto justify-center"
          >
            {isAuthenticated ? "Go to Dashboard" : "Start Building Now"}
            <ArrowRight className="w-4 h-4" />
          </button>
          {!isAuthenticated && (
            <button
              onClick={() => navigate("/login")}
              className="btn-ghost flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm w-full sm:w-auto justify-center"
            >
              Sign back in
            </button>
          )}
        </div>

        {/* Social proof strip */}
        <div
          className="animate-fade-rise flex flex-wrap justify-center items-center gap-x-8 gap-y-3"
          style={{ ...delay(580), color: C.textMuted, fontSize: "0.8125rem" }}
        >
          {[
            { icon: Users, label: "Guided resume workflow" },
            { icon: BarChart3, label: "ATS-focused writing feedback" },
            { icon: Briefcase, label: "Role-based starter templates" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2">
              <Icon
                className="w-4 h-4 flex-shrink-0"
                style={{ color: C.green }}
              />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          FEATURE CARDS — scroll-reveal
      ════════════════════════════════════════════════════════ */}
      <section
        className="relative z-10 px-4 sm:px-6 lg:px-8 py-24"
        style={{ borderTop: `1px solid ${C.divider}` }}
      >
        <div className="max-w-5xl mx-auto">
          {/* Section heading */}
          <div className="text-center mb-14 reveal">
            <span
              className="inline-block text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-4"
              style={{
                color: C.green,
                background: C.greenMuted,
                border: `1px solid ${C.greenBorder}`,
              }}
            >
              Features
            </span>
            <h2
              className="text-3xl sm:text-4xl font-bold tracking-tight"
              style={{ color: C.textPrimary }}
            >
              Everything you need to stand out
            </h2>
            <p
              className="mt-3 max-w-xl mx-auto"
              style={{ color: C.textSecondary }}
            >
              AI-powered tools designed around how modern hiring actually works.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            <FeatureCard
              icon={Sparkles}
              title="AI Suggestions"
              desc="Smart phrasing recommendations tailored to your industry to elevate your impact."
              revealDelay={0}
            />
            <FeatureCard
              icon={Zap}
              title="Lightning Fast"
              desc="Skip the formatting struggles. Focus purely on outlining your experience."
              revealDelay={110}
            />
            <FeatureCard
              icon={Target}
              title="ATS Optimized"
              desc="Clean layouts engineered to perfectly parse into applicant tracking systems."
              revealDelay={220}
            />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          STARTER GALLERY — scroll-reveal
      ════════════════════════════════════════════════════════ */}
      <section
        className="relative z-10 px-4 sm:px-6 lg:px-8 py-24"
        style={{ borderTop: `1px solid ${C.divider}` }}
      >
        <div className="max-w-6xl mx-auto">
          {/* Heading */}
          <div className="text-center mb-14 reveal">
            <span
              className="inline-block text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-4"
              style={{
                color: C.mint,
                background: C.mintMuted,
                border: `1px solid ${C.mintBorder}`,
              }}
            >
              Templates
            </span>
            <h2
              className="text-3xl sm:text-4xl font-bold tracking-tight"
              style={{ color: C.textPrimary }}
            >
              Start from proven resume examples
            </h2>
            <p
              className="mt-3 max-w-2xl mx-auto"
              style={{ color: C.textSecondary }}
            >
              Pick a starter, personalize it with your details, and save hours
              on structure and formatting.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <StarterCard
              title="Software Engineer"
              role="Backend / Full Stack"
              bullets={[
                "Impact-focused engineering bullets",
                "Projects + technical skills sections",
                "ATS-friendly structure",
              ]}
              onUse={() =>
                handleStarterSelect(
                  "software-engineer",
                  "Software Engineer Starter",
                )
              }
              revealDelay={0}
            />
            <StarterCard
              title="Product Manager"
              role="B2B / SaaS PM"
              bullets={[
                "Metrics and roadmap-first achievements",
                "Cross-functional leadership framing",
                "Clean executive summary format",
              ]}
              onUse={() =>
                handleStarterSelect(
                  "product-manager",
                  "Product Manager Starter",
                )
              }
              revealDelay={110}
            />
            <StarterCard
              title="UI/UX Designer"
              role="Product & Growth Design"
              bullets={[
                "Portfolio-friendly project highlights",
                "Design process and outcomes",
                "Modern visual storytelling",
              ]}
              onUse={() =>
                handleStarterSelect("ui-ux-designer", "UI/UX Designer Starter")
              }
              revealDelay={220}
            />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          BENEFITS — scroll-reveal
      ════════════════════════════════════════════════════════ */}
      <section
        className="relative z-10 px-4 sm:px-6 lg:px-8 py-24"
        style={{ borderTop: `1px solid ${C.divider}` }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14 reveal">
            <h2
              className="text-3xl sm:text-4xl font-bold tracking-tight"
              style={{ color: C.textPrimary }}
            >
              Why candidates choose ResumeAI
            </h2>
            <p className="mt-3" style={{ color: C.textSecondary }}>
              Designed to reduce friction, improve quality, and help you apply
              faster.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <BenefitCard
              icon={FileText}
              title="Less Blank-Page Stress"
              description="Start from a structured template so you can focus on your achievements instead of formatting."
              revealDelay={0}
            />
            <BenefitCard
              icon={Shield}
              title="Smarter Job Tailoring"
              description="Use ATS analysis and keyword suggestions to adapt your resume for each application."
              revealDelay={110}
            />
            <BenefitCard
              icon={Zap}
              title="Apply Faster"
              description="Export polished resumes in PDF and DOCX with fewer editing rounds."
              revealDelay={220}
            />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          FINAL CTA — glass card centrepiece
      ════════════════════════════════════════════════════════ */}
      <section
        className="relative z-10 px-4 sm:px-6 lg:px-8 py-24"
        style={{ borderTop: `1px solid ${C.divider}` }}
      >
        <div className="max-w-3xl mx-auto reveal">
          <div
            className="rounded-3xl p-10 sm:p-14 text-center"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)",
              border: `1px solid rgba(255,255,255,0.11)`,
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              /* Subtle green inner glow from below */
              boxShadow:
                "0 0 80px rgba(74,222,128,0.07), inset 0 1px 0 rgba(255,255,255,0.12)",
            }}
          >
            <div
              className="inline-flex w-14 h-14 rounded-2xl items-center justify-center mb-6 mx-auto"
              style={{
                background: C.greenMuted,
                border: `1px solid ${C.greenBorder}`,
              }}
            >
              <Sparkles className="w-6 h-6" style={{ color: C.green }} />
            </div>
            <h2
              className="text-3xl sm:text-4xl font-bold tracking-tight mb-4"
              style={{ color: C.textPrimary }}
            >
              Build your next opportunity today
            </h2>
            <p
              className="mb-8 max-w-lg mx-auto leading-relaxed"
              style={{ color: C.textSecondary }}
            >
              Start free, choose a proven template, and turn your experience
              into strong results.
            </p>
            <button
              onClick={() => navigate("/register")}
              className="btn-primary inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm"
            >
              Create My Resume
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════════════════ */}
      <footer
        className="relative z-10 text-center py-8 text-sm"
        style={{
          color: C.textMuted,
          borderTop: `1px solid ${C.divider}`,
        }}
      >
        © {currentYear} ResumeAI. All rights reserved.
      </footer>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
═══════════════════════════════════════════════════════════════ */

const FeatureCard = ({
  icon: Icon,
  title,
  desc,
  revealDelay,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  revealDelay: number;
}) => (
  <div
    className="glass-card rounded-2xl p-8 flex flex-col items-center text-center reveal"
    style={{ transitionDelay: `${revealDelay}ms` }}
  >
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 flex-shrink-0"
      style={{
        background: C.greenMuted,
        border: `1px solid ${C.greenBorder}`,
      }}
    >
      <Icon className="w-5 h-5" style={{ color: C.green }} />
    </div>
    <h3 className="font-semibold text-lg mb-2" style={{ color: C.textPrimary }}>
      {title}
    </h3>
    <p className="text-sm leading-relaxed" style={{ color: C.textSecondary }}>
      {desc}
    </p>
  </div>
);

const StarterCard = ({
  title,
  role,
  bullets,
  onUse,
  revealDelay,
}: {
  title: string;
  role: string;
  bullets: string[];
  onUse: () => void;
  revealDelay: number;
}) => (
  <div
    className="glass-card rounded-2xl p-7 flex flex-col reveal"
    style={{ transitionDelay: `${revealDelay}ms` }}
  >
    {/* Card header */}
    <div className="flex items-start justify-between mb-5 gap-3">
      <h3 className="text-lg font-bold" style={{ color: C.textPrimary }}>
        {title}
      </h3>
      <span
        className="text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 mt-0.5"
        style={{
          color: C.mint,
          background: C.mintMuted,
          border: `1px solid ${C.mintBorder}`,
        }}
      >
        {role}
      </span>
    </div>

    {/* Bullet list */}
    <div className="space-y-3 mb-6 flex-1">
      {bullets.map((bullet) => (
        <div key={bullet} className="flex items-start gap-2.5 text-sm">
          <CheckCircle2
            className="w-4 h-4 mt-0.5 flex-shrink-0"
            style={{ color: C.green }}
          />
          <span style={{ color: C.textSecondary }}>{bullet}</span>
        </div>
      ))}
    </div>

    {/* CTA button */}
    <button
      onClick={onUse}
      className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
      style={{
        background: C.greenMuted,
        border: `1px solid ${C.greenBorder}`,
        color: C.green,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(74,222,128,0.20)";
        e.currentTarget.style.borderColor = "rgba(74,222,128,0.42)";
        e.currentTarget.style.boxShadow = "0 0 16px rgba(74,222,128,0.18)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = C.greenMuted;
        e.currentTarget.style.borderColor = C.greenBorder;
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      Use This Starter
    </button>
  </div>
);

const BenefitCard = ({
  icon: Icon,
  title,
  description,
  revealDelay,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  revealDelay: number;
}) => (
  <div
    className="glass-card rounded-2xl p-7 reveal"
    style={{ transitionDelay: `${revealDelay}ms` }}
  >
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
      style={{
        background: C.greenMuted,
        border: `1px solid ${C.greenBorder}`,
      }}
    >
      <Icon className="w-5 h-5" style={{ color: C.green }} />
    </div>
    <h4 className="text-lg font-bold mb-2" style={{ color: C.textPrimary }}>
      {title}
    </h4>
    <p className="leading-relaxed text-sm" style={{ color: C.textSecondary }}>
      {description}
    </p>
  </div>
);

export default HomePage;
