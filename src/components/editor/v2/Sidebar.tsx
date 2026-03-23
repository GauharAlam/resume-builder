import React, { useState, useRef, useEffect } from 'react';
import { LayoutGrid, User, Trophy, FileText, Mail, Briefcase, LogOut, History, Award, Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context';

const Sidebar: React.FC = () => {
  const [activeItem, setActiveItem] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const icons = [LayoutGrid, User, Trophy, FileText, Mail, Briefcase, Award];
  const sectionNames = ['Basics', 'Professional Summary', 'Experience', 'Education', 'Skills', 'Projects', 'Accomplishments'];

  const handleNavClick = (idx: number) => {
    setActiveItem(idx);
    
    // Dispatch event to open accordion automatically
    window.dispatchEvent(new CustomEvent('open-section', { detail: sectionNames[idx] }));
    
    // Give state time to update the DOM, then scroll.
    setTimeout(() => {
      document.getElementById(`section-${idx}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-16 bg-white border-r border-gray-200 h-screen flex flex-col justify-between items-center py-4 flex-shrink-0 relative z-50">
      {/* TOP */}
      <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white mb-8 shadow-sm">
        <LayoutGrid size={20} />
      </div>

      {/* MIDDLE */}
      <div className="flex-1 flex flex-col gap-3 w-full px-2">
        {icons.map((Icon, idx) => (
          <button
            key={idx}
            className={`p-3 rounded-xl flex items-center justify-center transition-all w-full ${
              activeItem === idx
                ? 'bg-emerald-50 text-emerald-600 shadow-sm border border-emerald-100'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => handleNavClick(idx)}
            title={sectionNames[idx]}
          >
            <Icon size={20} className={activeItem === idx ? 'stroke-[2.5px]' : 'stroke-2'} />
          </button>
        ))}

        <div className="mt-2 pt-3 border-t border-gray-100">
          <button
            className="p-3 rounded-xl flex items-center justify-center transition-all w-full text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100"
            onClick={() => window.dispatchEvent(new CustomEvent('open-chatbot'))}
            title="Ask AI Assistant"
          >
            <Bot size={20} className="stroke-[2.5px]" />
          </button>
        </div>
      </div>

      {/* BOTTOM */}
      <div className="relative mt-8" ref={menuRef}>
        <div 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm cursor-pointer hover:bg-emerald-200 transition-colors border border-emerald-200 shadow-sm select-none"
        >
          A
        </div>

        {isMenuOpen && (
          <div className="absolute left-[60px] bottom-0 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-2 overflow-hidden animate-in fade-in slide-in-from-left-2 duration-200">
            <button 
              onClick={() => {
                navigate('/history');
                setIsMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
            >
              <History size={16} className="text-gray-400" />
              <span className="font-medium">Dashboard</span>
            </button>
            <div className="my-1 border-t border-gray-100"></div>
            <button 
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
            >
              <LogOut size={16} className="text-red-500" />
              <span className="font-medium">Sign out</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
