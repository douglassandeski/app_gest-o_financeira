import React, { useState, useRef, useEffect } from 'react';
import { 
  DollarSign, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Eye, 
  EyeOff, 
  MoreVertical, 
  Table, 
  Download, 
  RotateCcw, 
  PieChart, 
  LayoutDashboard, 
  ReceiptText, 
  Target, 
  BarChart3,
  Search,
  LogOut,
  User as UserIcon,
  Info
} from 'lucide-react';
import { ActiveScreen } from '../types/finance';
import { formatMonthYear } from '../utils/formatters';
import { User } from '../lib/firebase';
import { AboutModal } from './AboutModal';

interface NavbarProps {
  currentScreen: ActiveScreen;
  onSelectScreen: (screen: ActiveScreen) => void;
  selectedMonth: string; // YYYY-MM
  onMonthChange: (newMonth: string) => void;
  hideValues: boolean;
  onToggleHideValues: () => void;
  onOpenNewTransaction: () => void;
  onExportCSV: () => void;
  onResetData: () => void;
  currentUser?: User | null;
  onLogout?: () => void;
  onLoginClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  onSelectScreen,
  selectedMonth,
  onMonthChange,
  hideValues,
  onToggleHideValues,
  onOpenNewTransaction,
  onExportCSV,
  onResetData,
  currentUser,
  onLogout,
  onLoginClick,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Month navigation helpers
  const handlePrevMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    let newYear = year;
    let newMonth = month - 1;
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    onMonthChange(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    let newYear = year;
    let newMonth = month + 1;
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    onMonthChange(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0A0E17]/95 border-b border-[#1E293B] backdrop-blur-md">
      {/* Top Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo with $ Dollar Sign in TradeMap Cyan */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onSelectScreen('dashboard')}
              className="flex items-center gap-2.5 group text-left focus:outline-none"
            >
              {/* App Logo */}
              <div className="w-9 h-9 rounded-xl overflow-hidden border border-[#00D2B5]/50 flex items-center justify-center shadow-[0_0_15px_rgba(0,210,181,0.25)] group-hover:border-[#00D2B5] transition-all bg-[#0F172A]">
                <img src="/pwa-192x192.png" alt="Gestão Financeira Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="text-base font-extrabold tracking-tight text-white group-hover:text-[#00D2B5] transition-colors">
                  Gestão Financeira
                </span>
              </div>
            </button>
          </div>

          {/* Center: Month/Period Selector */}
          <div className="hidden md:flex items-center bg-[#0D1424] border border-[#1E293B] rounded-xl px-2 py-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E293B] transition-colors"
              title="Mês Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-semibold text-slate-200 tracking-wide min-w-[130px] text-center capitalize">
              {formatMonthYear(`${selectedMonth}-01`)}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E293B] transition-colors"
              title="Próximo Mês"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2.5">
            {/* Toggle Hide Values (Privacy eye) */}
            <button
              type="button"
              onClick={onToggleHideValues}
              className={`p-2 rounded-xl border transition-all ${
                hideValues
                  ? 'bg-[#1E293B] text-[#00D2B5] border-[#00D2B5]/50'
                  : 'bg-[#0D1424] text-slate-400 border-[#1E293B] hover:text-white'
              }`}
              title={hideValues ? 'Mostrar Valores' : 'Ocultar Valores (Privacidade)'}
            >
              {hideValues ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>

            {/* Quick Add Button with TradeMap Neon */}
            <button
              type="button"
              onClick={onOpenNewTransaction}
              className="px-3.5 py-2 rounded-xl bg-[#00D2B5] hover:bg-[#00F0C8] text-[#090D16] text-xs font-extrabold shadow-[0_0_15px_rgba(0,210,181,0.35)] transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">Novo Lançamento</span>
            </button>

            {/* User Profile Avatar or Login Trigger */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-1">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Usuário'}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-xl border border-[#00D2B5]/50 object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-[#00D2B5]/20 border border-[#00D2B5]/40 flex items-center justify-center text-[#00D2B5] font-bold text-xs">
                    {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
                  </div>
                )}
              </div>
            ) : onLoginClick ? (
              <button
                type="button"
                onClick={onLoginClick}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#131D2E] border border-[#1E293B] hover:border-[#00D2B5]/50 text-slate-300 text-xs font-medium"
              >
                <UserIcon className="w-3.5 h-3.5 text-[#00D2B5]" />
                <span>Entrar</span>
              </button>
            ) : null}

            {/* Three Dots More Menu */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-xl bg-[#0D1424] border border-[#1E293B] text-slate-400 hover:text-white hover:bg-[#131D2E] transition-colors"
                title="Mais Opções"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-[#0D1424] border border-[#1E293B] rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95">
                  {currentUser && (
                    <div className="px-3.5 py-2.5 border-b border-[#1E293B] bg-[#090D16]/50">
                      <div className="text-xs font-bold text-white truncate">
                        {currentUser.displayName || 'Usuário Conectado'}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {currentUser.email}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-[#00D2B5] font-semibold mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00D2B5] animate-pulse" />
                        <span>Sincronizado na Nuvem</span>
                      </div>
                    </div>
                  )}

                  <div className="px-3 py-1.5 border-b border-[#1E293B] text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Recursos & Ferramentas
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectScreen('spreadsheet');
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-200 hover:bg-[#1A253A] hover:text-[#00D2B5] transition-colors text-left"
                  >
                    <Table className="w-4 h-4 text-[#00D2B5]" />
                    <span>Abrir Planilha Excel</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onExportCSV();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-200 hover:bg-[#1A253A] hover:text-[#00D2B5] transition-colors text-left"
                  >
                    <Download className="w-4 h-4 text-slate-400" />
                    <span>Exportar Dados (.CSV)</span>
                  </button>
                  <div className="my-1 border-t border-[#1E293B]" />
                  <button
                    type="button"
                    onClick={() => {
                      setShowAboutModal(true);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-200 hover:bg-[#1A253A] hover:text-[#00D2B5] transition-colors text-left"
                  >
                    <Info className="w-4 h-4 text-[#00D2B5]" />
                    <span>Sobre o Criador</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Deseja zerar todos os lançamentos e contas para começar do zero?')) {
                        onResetData();
                      }
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-400 hover:bg-rose-950/30 transition-colors text-left"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Zerar Dados do Aplicativo</span>
                  </button>

                  {currentUser && onLogout && (
                    <>
                      <div className="my-1 border-t border-[#1E293B]" />
                      <button
                        type="button"
                        onClick={() => {
                          onLogout();
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:bg-rose-950/30 hover:text-rose-300 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4 text-slate-400" />
                        <span>Sair da Conta Google</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Screen Tabs Bar (Separated screens as requested) */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 -mx-4 px-4 sm:mx-0 sm:px-0 border-t border-[#1E293B]/60 scrollbar-none">
          <button
            type="button"
            onClick={() => onSelectScreen('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              currentScreen === 'dashboard'
                ? 'bg-[#131D2E] text-[#00D2B5] border border-[#00D2B5]/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#0D1424]'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Visão Geral</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectScreen('transactions')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              currentScreen === 'transactions'
                ? 'bg-[#131D2E] text-[#00D2B5] border border-[#00D2B5]/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#0D1424]'
            }`}
          >
            <ReceiptText className="w-3.5 h-3.5" />
            <span>Extrato Detalhado</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectScreen('spreadsheet')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              currentScreen === 'spreadsheet'
                ? 'bg-[#131D2E] text-[#00D2B5] border border-[#00D2B5]/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#0D1424]'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Planilha Excel</span>
            <span className="text-[10px] px-1 rounded bg-[#00D2B5]/20 text-[#00D2B5]">Grade</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectScreen('budgets')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              currentScreen === 'budgets'
                ? 'bg-[#131D2E] text-[#00D2B5] border border-[#00D2B5]/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#0D1424]'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Orçamentos & Metas</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectScreen('reports')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              currentScreen === 'reports'
                ? 'bg-[#131D2E] text-[#00D2B5] border border-[#00D2B5]/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#0D1424]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Relatórios</span>
          </button>

          {/* Mobile month selector fallback */}
          <div className="md:hidden ml-auto flex items-center bg-[#0D1424] border border-[#1E293B] rounded-lg px-1.5 py-0.5 text-xs text-slate-300">
            <button onClick={handlePrevMonth} className="p-1">
              <ChevronLeft className="w-3 h-3" />
            </button>
            <span className="px-1 text-[11px] font-mono-nums">
              {selectedMonth}
            </span>
            <button onClick={handleNextMonth} className="p-1">
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Discrete Creator & App Info Modal */}
      <AboutModal
        isOpen={showAboutModal}
        onClose={() => setShowAboutModal(false)}
      />
    </header>
  );
};
