import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const SectionCard: React.FC<SectionCardProps> = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  React.useEffect(() => {
    const handleOpen = (e: CustomEvent | Event) => {
      if ('detail' in e && e.detail === title) {
        setIsOpen(true);
      }
    };
    window.addEventListener('open-section', handleOpen);
    return () => window.removeEventListener('open-section', handleOpen);
  }, [title]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden transition-all duration-200">
      <div 
        className="w-full flex justify-between items-center p-6 cursor-pointer hover:bg-gray-50 bg-white select-none transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {isOpen ? (
          <ChevronUp className="text-gray-400" size={20} />
        ) : (
          <ChevronDown className="text-gray-400" size={20} />
        )}
      </div>
      
      {isOpen && (
        <div className="px-6 pb-6 pt-2 space-y-4 border-t border-gray-100 bg-white">
          {children}
        </div>
      )}
    </div>
  );
};

export default SectionCard;
