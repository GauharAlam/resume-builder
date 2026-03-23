import React from "react";
import { Sparkles, Zap, FileText, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HomePage: React.FC = () => {
  const navigate = useNavigate();

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

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 text-center text-gray-400 text-sm border-t border-gray-200 bg-white">
        © {new Date().getFullYear()} ResumeAI. All rights reserved.
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

export default HomePage;