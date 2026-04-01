import React, { useEffect } from "react";
import { Sparkles, Zap, FileText, ArrowRight, Users, Briefcase, BarChart3, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { trackEventOncePerSession } from "@/services/analytics";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    trackEventOncePerSession("funnel_visit_home", "visit_home");
  }, []);

  const handleStarterSelect = (starterKey: string, starterTitle: string) => {
    localStorage.setItem("starter_resume_key", starterKey);
    localStorage.setItem("starter_resume_title", starterTitle);
    navigate("/register");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 sm:px-12 py-5 bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">ResumeAI</span>
        </div>
        
        <div className="flex items-center gap-4">
           <button 
             onClick={() => navigate('/login')}
             className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
           >
             Log in
           </button>
           <button 
             onClick={() => navigate('/register')}
             className="text-sm font-medium px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
           >
             Get Started
           </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-24 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
        <div className="w-full max-w-4xl text-center space-y-8 bg-gray-50/80 backdrop-blur-sm p-4 rounded-3xl">
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 mb-4 shadow-sm">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">
              The modern standard for resumes
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 tracking-tight leading-tight">
            Build a resume that <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">
              opens doors.
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Create an ATS-friendly, beautifully designed resume in minutes. Stand out to employers without the hassle of formatting documents.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <button
              onClick={() => navigate("/register")}
              className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg hover:bg-emerald-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              Start Building Now
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate("/login")}
              className="w-full sm:w-auto px-8 py-3.5 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 shadow-sm hover:bg-gray-50 hover:-translate-y-0.5 transition-all flex items-center justify-center"
            >
              Sign back in
            </button>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 pt-20">
            <FeatureCard 
               icon={Sparkles} 
               title="AI Suggestions" 
               desc="Smart phrasing recommendations tailored to your industry to elevate your impact." 
            />
            <FeatureCard 
               icon={Zap} 
               title="Lightning Fast" 
               desc="Skip the formatting struggles. Focus purely on outlining your experience." 
            />
             <FeatureCard 
               icon={FileText} 
               title="ATS Optimized" 
               desc="Clean layouts engineered to perfectly parse into applicant tracking systems." 
            />
          </div>

          <div className="pt-8 flex flex-wrap justify-center items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>Guided resume workflow</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span>ATS-focused writing feedback</span>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-600" />
              <span>Role-based starter templates</span>
            </div>
          </div>

        </div>
      </main>

      {/* Starter Gallery */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Start from proven resume examples
            </h2>
            <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
              Pick a starter, personalize it with your details, and save hours on structure and formatting.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <StarterCard
              title="Software Engineer"
              role="Backend / Full Stack"
              bullets={["Impact-focused engineering bullets", "Projects + technical skills sections", "ATS-friendly structure"]}
              onUse={() => handleStarterSelect("software-engineer", "Software Engineer Starter")}
            />
            <StarterCard
              title="Product Manager"
              role="B2B / SaaS PM"
              bullets={["Metrics and roadmap-first achievements", "Cross-functional leadership framing", "Clean executive summary format"]}
              onUse={() => handleStarterSelect("product-manager", "Product Manager Starter")}
            />
            <StarterCard
              title="UI/UX Designer"
              role="Product & Growth Design"
              bullets={["Portfolio-friendly project highlights", "Design process and outcomes", "Modern visual storytelling"]}
              onUse={() => handleStarterSelect("ui-ux-designer", "UI/UX Designer Starter")}
            />
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 bg-gray-50 border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">Why candidates choose ResumeAI</h3>
            <p className="text-gray-500 mt-3">Designed to reduce friction, improve quality, and help you apply faster.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <BenefitCard
              title="Less Blank-Page Stress"
              description="Start from a structured template so you can focus on your achievements instead of formatting."
            />
            <BenefitCard
              title="Smarter Job Tailoring"
              description="Use ATS analysis and keyword suggestions to adapt your resume for each application."
            />
            <BenefitCard
              title="Apply Faster"
              description="Export polished resumes in PDF and DOCX with fewer editing rounds."
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">Build your next opportunity today</h3>
          <p className="text-gray-500 mt-3">Start free, choose a proven template, and turn your experience into strong results.</p>
          <button
            onClick={() => navigate("/register")}
            className="mt-6 px-8 py-3.5 bg-emerald-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg hover:bg-emerald-700 transition-all inline-flex items-center gap-2"
          >
            Create My Resume
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-8 text-center text-gray-400 text-sm border-t border-gray-200 bg-white">
        © {currentYear} ResumeAI. All rights reserved.
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <div className="p-8 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center text-center hover:shadow-md hover:border-emerald-200 transition-all">
     <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-5 text-emerald-600">
        <Icon className="w-6 h-6" />
     </div>
     <h3 className="font-semibold text-gray-900 mb-2 text-lg">{title}</h3>
     <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
  </div>
);

const StarterCard = ({
  title,
  role,
  bullets,
  onUse,
}: {
  title: string;
  role: string;
  bullets: string[];
  onUse: () => void;
}) => (
  <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-full">{role}</span>
    </div>
    <div className="space-y-2 mb-5">
      {bullets.map((bullet) => (
        <div key={bullet} className="flex items-start gap-2 text-sm text-gray-600">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" />
          <span>{bullet}</span>
        </div>
      ))}
    </div>
    <button
      onClick={onUse}
      className="w-full py-2.5 bg-white border border-emerald-200 text-emerald-700 font-semibold rounded-lg hover:bg-emerald-50 transition-colors"
    >
      Use This Starter
    </button>
  </div>
);

const BenefitCard = ({ title, description }: { title: string; description: string }) => (
  <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
    <h4 className="text-lg font-bold text-gray-900">{title}</h4>
    <p className="text-gray-600 mt-2 leading-relaxed">{description}</p>
  </div>
);

export default HomePage;
