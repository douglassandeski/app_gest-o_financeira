import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  X, 
  GraduationCap, 
  Code2, 
  Award,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { getFixedCreatorPhoto } from '../utils/creatorProfile';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const [photoUrl, setPhotoUrl] = useState<string>('/creator-photo.jpg');

  useEffect(() => {
    let isMounted = true;
    getFixedCreatorPhoto().then((url) => {
      if (isMounted && url) {
        setPhotoUrl(url);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-[#0D1424] border border-[#1E293B] rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#1E293B] transition-colors cursor-pointer"
          title="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-3 border-b border-[#1E293B] pb-4">
          <div className="w-11 h-11 rounded-2xl bg-[#00D2B5]/15 border border-[#00D2B5]/40 shadow-lg shadow-[#00D2B5]/10 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-6 h-6 text-[#00D2B5] stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-base font-black text-white tracking-tight">
              Gestão Financeira
            </h3>
            <span className="text-[11px] text-[#00D2B5] font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Conheça o Autor do Aplicativo
            </span>
          </div>
        </div>

        {/* Creator Profile Card with Fixed Photo */}
        <div className="bg-[#090D16] border border-[#1E293B] rounded-2xl p-4.5 space-y-4">
          <div className="flex items-start gap-4">
            {/* The Photo Square - 100% Fixed */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl border-2 border-[#00D2B5]/60 overflow-hidden bg-[#131D2E] shadow-xl shadow-[#00D2B5]/10 flex items-center justify-center">
                <img
                  src={photoUrl}
                  alt="Douglas Sandeski"
                  referrerPolicy="no-referrer"
                  onError={() => {
                    if (photoUrl !== '/creator-photo.jpg') {
                      setPhotoUrl('/creator-photo.jpg');
                    }
                  }}
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </div>

            {/* Title & Name */}
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#00D2B5]/15 border border-[#00D2B5]/30 text-[10px] font-extrabold text-[#00D2B5] uppercase tracking-wider mb-1">
                <Award className="w-3 h-3" />
                <span>Criador & Desenvolvedor</span>
              </div>
              <h2 className="text-xl font-black text-white tracking-tight">
                Douglas Sandeski
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Idealizador e desenvolvedor do sistema de Gestão Financeira.
              </p>
            </div>
          </div>

          {/* Academic & Professional Trajectory */}
          {/* Academic Trajectory */}
          <div className="space-y-2.5 pt-2 border-t border-[#1E293B]/70 text-xs">
            {/* Economia */}
            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#0D1424] border border-[#1E293B]">
              <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 flex-shrink-0 mt-0.5">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Curso Superior em Andamento
                </span>
                <span className="text-xs font-bold text-slate-100 block">
                  Ciências Econômicas
                </span>
                <span className="text-[11px] text-blue-400 font-medium">
                  Unioeste (Universidade Estadual do Oeste do Paraná)
                </span>
              </div>
            </div>

            {/* TIC */}
            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#0D1424] border border-[#1E293B]">
              <div className="w-8 h-8 rounded-lg bg-[#00D2B5]/15 border border-[#00D2B5]/30 flex items-center justify-center text-[#00D2B5] flex-shrink-0 mt-0.5">
                <Code2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Formação Tecnológica
                </span>
                <span className="text-xs font-bold text-slate-100 block">
                  Tecnólogo em TI e Comunicação (TIC)
                </span>
                <span className="text-[11px] text-[#00D2B5] font-medium">
                  UEPG (Universidade Estadual de Ponta Grossa)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note & Button */}
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#00D2B5]" />
            <span>Gestão Financeira Pessoal • Segurança e Nuvem Google</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl bg-[#00D2B5] hover:bg-[#00F0C8] text-[#090D16] font-extrabold text-xs transition-all shadow-md active:scale-98 cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
