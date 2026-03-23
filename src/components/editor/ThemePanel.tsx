import React from 'react';
import { useResume } from '@/hooks';
import { FontFamily, FontSize, LayoutSpacing } from '@/types';
import { Check, Type, Palette, Layout, MousePointer2 } from 'lucide-react';

const COLORS = [
  { name: 'Indigo', value: '#4F46E5' },
  { name: 'Emerald', value: '#10B981' },
  { name: 'Rose', value: '#F43F5E' },
  { name: 'Amber', value: '#F59E0B' },
  { name: 'Slate', value: '#475569' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Violet', value: '#8B5CF6' },
  { name: 'Orange', value: '#F97316' },
];

const FONTS: { id: FontFamily; name: string; type: string }[] = [
  { id: 'inter', name: 'Inter', type: 'Sans' },
  { id: 'roboto', name: 'Roboto', type: 'Sans' },
  { id: 'playfair', name: 'Playfair Display', type: 'Serif' },
  { id: 'merriweather', name: 'Merriweather', type: 'Serif' },
  { id: 'fira-code', name: 'Fira Code', type: 'Mono' },
  { id: 'monaco', name: 'Monaco', type: 'Mono' },
];

const ThemePanel: React.FC = () => {
  const { resumeData, updateResumeData } = useResume();
  const { accentColor, customization } = resumeData;

  const handleColorChange = (color: string) => {
    updateResumeData({ accentColor: color });
  };

  const handleFontChange = (font: FontFamily) => {
    updateResumeData({
      customization: { ...customization, fontFamily: font }
    });
  };

  const handleFontSizeChange = (size: FontSize) => {
     updateResumeData({
      customization: { ...customization, fontSize: size }
    });
  };

  const handleLayoutChange = (layout: LayoutSpacing) => {
     updateResumeData({
      customization: { ...customization, layout: layout }
    });
  };

  return (
    <div className="p-6 space-y-8 animate-in slide-in-from-right-4 duration-300">
      {/* Color Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Palette size={18} className="text-gray-400" />
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Accent Color</h3>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {COLORS.map((c) => (
            <button
              key={c.value}
              onClick={() => handleColorChange(c.value)}
              className="group relative flex flex-col items-center gap-1"
            >
              <div
                className={`w-10 h-10 rounded-full border-2 transition-all ${
                  accentColor === c.value ? 'border-gray-900 scale-110 shadow-md' : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: c.value }}
              >
                {accentColor === c.value && (
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    <Check size={16} strokeWidth={3} />
                  </div>
                )}
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                {c.name}
              </span>
            </button>
          ))}
          <div className="relative group flex flex-col items-center gap-1">
            <label className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-gray-400 transition-all overflow-hidden bg-gray-50">
                <MousePointer2 size={16} className="text-gray-400" />
                <input 
                    type="color" 
                    value={accentColor} 
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                />
            </label>
            <span className="text-[10px] font-bold text-gray-400 uppercase">Custom</span>
          </div>
        </div>
      </section>

      {/* Typography Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Type size={18} className="text-gray-400" />
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Typography</h3>
        </div>
        <div className="space-y-2">
          {FONTS.map((font) => (
            <button
              key={font.id}
              onClick={() => handleFontChange(font.id)}
              className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all group ${
                customization.fontFamily === font.id
                  ? 'border-gray-900 bg-gray-900 text-white shadow-lg'
                  : 'border-gray-100 hover:border-gray-200 bg-white text-gray-600'
              }`}
            >
              <div className="text-left">
                <p className="text-sm font-bold truncate">{font.name}</p>
                <p className={`text-[10px] font-bold uppercase ${customization.fontFamily === font.id ? 'text-gray-400' : 'text-gray-400 group-hover:text-gray-500'}`}>
                  {font.type}
                </p>
              </div>
              {customization.fontFamily === font.id && <Check size={16} strokeWidth={3} />}
            </button>
          ))}
        </div>
      </section>

      {/* Layout Density Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Layout size={18} className="text-gray-400" />
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Layout Density</h3>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          {(['compact', 'standard', 'spacious'] as LayoutSpacing[]).map((sp) => (
            <button
              key={sp}
              onClick={() => handleLayoutChange(sp)}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                customization.layout === sp
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'
              }`}
            >
              {sp}
            </button>
          ))}
        </div>
      </section>

       {/* Font Size Section */}
       <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center justify-center w-[18px] h-[18px] border-2 border-gray-400 rounded text-[10px] leading-none font-bold text-gray-400">A</div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Font Size</h3>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          {(['small', 'medium', 'large'] as FontSize[]).map((sz) => (
            <button
              key={sz}
              onClick={() => handleFontSizeChange(sz)}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                customization.fontSize === sz
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'
              }`}
            >
              {sz}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ThemePanel;
