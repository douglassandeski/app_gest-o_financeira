import React, { useState } from 'react';
import { motion } from 'motion/react';
import { formatCurrency } from '../utils/formatters';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  TrendingUp, 
  Sparkles, 
  AlertTriangle,
  Plus,
  PieChart,
  Layers
} from 'lucide-react';

export interface DonutSlice {
  id: string;
  name: string;
  value: number;
  color: string;
  percentage: number;
  type?: string;
}

export interface CentralFinancialCircleProps {
  totalIncome?: number;
  totalExpense?: number;
  totalInvestment?: number;
  netBalance?: number;
  categorySlices?: DonutSlice[];
  hideValues?: boolean;
  selectedMonthName?: string;
  onOpenNewTransaction?: (type: 'income' | 'expense' | 'investment') => void;
  transactionsCount?: number;
  // All time comparison support
  allTimeIncome?: number;
  allTimeExpense?: number;
  allTimeInvestment?: number;
  allTimeCategorySlices?: DonutSlice[];
}

export const CentralFinancialCircle: React.FC<CentralFinancialCircleProps> = ({
  totalIncome = 0,
  totalExpense = 0,
  totalInvestment = 0,
  netBalance,
  categorySlices = [],
  hideValues = false,
  selectedMonthName = 'Mês Atual',
  onOpenNewTransaction,
  transactionsCount = 0,
  allTimeIncome,
  allTimeExpense,
  allTimeInvestment,
  allTimeCategorySlices = [],
}) => {
  const [viewMode, setViewMode] = useState<'flow' | 'categories'>('flow');
  const [periodScope, setPeriodScope] = useState<'month' | 'all'>('month');
  const [hoveredSlice, setHoveredSlice] = useState<DonutSlice | null>(null);

  // Determine active dataset based on scope
  const rawIncome = periodScope === 'all' && typeof allTimeIncome === 'number' ? allTimeIncome : totalIncome;
  const rawExpense = periodScope === 'all' && typeof allTimeExpense === 'number' ? allTimeExpense : totalExpense;
  const rawInvestment = periodScope === 'all' && typeof allTimeInvestment === 'number' ? allTimeInvestment : totalInvestment;
  const activeCategorySlices = periodScope === 'all' && allTimeCategorySlices.length > 0 ? allTimeCategorySlices : categorySlices;

  // Safe numerical guarantees (strictly prevents NaN)
  const safeIncome = typeof rawIncome === 'number' && !isNaN(rawIncome) ? Math.max(0, rawIncome) : 0;
  const safeExpense = typeof rawExpense === 'number' && !isNaN(rawExpense) ? Math.max(0, rawExpense) : 0;
  const safeInvestment = typeof rawInvestment === 'number' && !isNaN(rawInvestment) ? Math.max(0, rawInvestment) : 0;
  // Saldo Disponível (Available Balance): Receitas deduzidas de Despesas E Aportes/Investimentos
  const safeNet = typeof netBalance === 'number' && !isNaN(netBalance) && periodScope === 'month'
    ? netBalance
    : (safeIncome - safeExpense - safeInvestment);

  const totalFlow = safeIncome + safeExpense + safeInvestment;

  // Slices for general cashflow (Receitas vs Despesas vs Investimentos)
  const flowSlices: DonutSlice[] = [
    {
      id: 'income',
      name: 'Receitas',
      value: safeIncome,
      color: '#00D2B5', // TradeMap Cyan
      percentage: totalFlow > 0 ? (safeIncome / totalFlow) * 100 : 0,
      type: 'income',
    },
    {
      id: 'expense',
      name: 'Despesas',
      value: safeExpense,
      color: '#F43F5E', // Rose / Coral
      percentage: totalFlow > 0 ? (safeExpense / totalFlow) * 100 : 0,
      type: 'expense',
    },
    {
      id: 'investment',
      name: 'Investimentos',
      value: safeInvestment,
      color: '#6366F1', // Indigo / Purple
      percentage: totalFlow > 0 ? (safeInvestment / totalFlow) * 100 : 0,
      type: 'investment',
    },
  ].filter(s => s.value > 0);

  // Active slice set
  const activeSlices = viewMode === 'flow' 
    ? flowSlices 
    : (activeCategorySlices.length > 0 ? activeCategorySlices : flowSlices);

  // Donut geometry
  const size = 280;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate arc dash arrays with crisp spacing
  let accumulatedPercent = 0;
  const gap = activeSlices.length > 1 ? 4 : 0; // 4px gap between slices
  const svgArcs = activeSlices.map(slice => {
    const arcLength = (slice.percentage / 100) * circumference;
    const strokeDash = Math.max(1, arcLength - gap);
    const strokeDasharray = `${strokeDash} ${circumference}`;
    const strokeDashoffset = -((accumulatedPercent / 100) * circumference + gap / 2);
    accumulatedPercent += slice.percentage;
    return {
      ...slice,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  // Savings rate calculation
  const savingsRate = safeIncome > 0 ? Math.max(0, ((safeIncome - safeExpense) / safeIncome) * 100) : 0;

  return (
    <div id="central-financial-circle-card" className="w-full bg-[#0D1424] border border-[#1E293B] rounded-2xl p-5 md:p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
      {/* Background ambient light */}
      <div className="absolute -top-16 -left-16 w-48 h-48 bg-[#00D2B5]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-[#F43F5E]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#00D2B5] shadow-[0_0_8px_#00D2B5]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Termômetro Financeiro
            </h2>
          </div>

          {/* Period Scope Toggle: Mês vs Todo o Período */}
          {typeof allTimeIncome === 'number' && (
            <div className="flex bg-[#090D16] p-0.5 rounded-lg border border-[#1E293B] text-[11px]">
              <button
                type="button"
                onClick={() => setPeriodScope('month')}
                className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                  periodScope === 'month'
                    ? 'bg-[#1E293B] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Visualizar apenas o mês selecionado"
              >
                Mês
              </button>
              <button
                type="button"
                onClick={() => setPeriodScope('all')}
                className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                  periodScope === 'all'
                    ? 'bg-[#1E293B] text-[#00D2B5] shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Visualizar todos os lançamentos cadastrados"
              >
                Geral
              </button>
            </div>
          )}
        </div>

        {/* View Mode Toggle: Fluxo Geral vs Por Categoria */}
        <div className="grid grid-cols-2 gap-1.5 bg-[#090D16] p-1 rounded-xl border border-[#1E293B] text-xs">
          <button
            type="button"
            onClick={() => setViewMode('flow')}
            className={`py-1.5 px-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'flow'
                ? 'bg-[#00D2B5] text-[#090D16] shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-[#131D2E]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Receitas vs Despesas</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('categories')}
            className={`py-1.5 px-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'categories'
                ? 'bg-[#00D2B5] text-[#090D16] shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-[#131D2E]'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>Por Categoria</span>
          </button>
        </div>
      </div>

      {/* Donut Chart Display */}
      <div className="relative my-4 flex items-center justify-center">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="rotate-[-90deg] transition-all duration-300"
        >
          {/* Base track ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#151E2E"
            strokeWidth={strokeWidth}
          />

          {/* Render active arc slices */}
          {totalFlow > 0 && svgArcs.map((arc) => {
            const isHovered = hoveredSlice?.id === arc.id;
            return (
              <circle
                key={arc.id}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={arc.color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={arc.strokeDasharray}
                strokeDashoffset={arc.strokeDashoffset}
                strokeLinecap="butt"
                className="transition-all duration-200 cursor-pointer"
                style={{
                  filter: isHovered ? `drop-shadow(0 0 12px ${arc.color})` : undefined,
                  opacity: hoveredSlice && !isHovered ? 0.35 : 1,
                }}
                onMouseEnter={() => setHoveredSlice(arc)}
                onMouseLeave={() => setHoveredSlice(null)}
              />
            );
          })}

          {/* Empty state dashed ring when 0 flow */}
          {totalFlow === 0 && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#223049"
              strokeWidth={strokeWidth}
              strokeDasharray="8 6"
              className="opacity-40 animate-pulse"
            />
          )}
        </svg>

        {/* Center Overlay Text & Values */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 pointer-events-none">
          {hoveredSlice ? (
            <motion.div
              key="hovered-content"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col items-center max-w-[200px]"
            >
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: hoveredSlice.color }} />
                <span className="text-xs uppercase tracking-wider text-slate-300 font-bold truncate">
                  {hoveredSlice.name}
                </span>
              </div>
              <span className="text-xl font-bold font-mono-nums mt-0.5" style={{ color: hoveredSlice.color }}>
                {formatCurrency(hoveredSlice.value, hideValues)}
              </span>
              <span className="text-xs px-2 py-0.5 mt-1 rounded-full bg-[#090D16] border border-[#1E293B] font-mono-nums text-slate-300">
                {hoveredSlice.percentage.toFixed(1)}% do total
              </span>
            </motion.div>
          ) : totalFlow === 0 ? (
            <div className="flex flex-col items-center max-w-[200px]">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                Nenhum Lançamento
              </span>
              <span className="text-2xl font-bold font-mono-nums text-slate-500 my-0.5">
                {formatCurrency(0, hideValues)}
              </span>
              <span className="text-[10px] text-slate-500 px-2">
                Cadastre receitas e despesas para gerar o gráfico
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center max-w-[220px]">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                {viewMode === 'flow' ? 'Saldo Disponível' : 'Total em Despesas'}
              </span>
              <span
                className={`text-2xl font-black font-mono-nums tracking-tight my-0.5 ${
                  viewMode === 'flow'
                    ? safeNet >= 0 ? 'text-[#00D2B5]' : 'text-[#F43F5E]'
                    : 'text-[#F43F5E]'
                }`}
              >
                {viewMode === 'flow' && safeNet > 0 ? '+' : ''}
                {formatCurrency(viewMode === 'flow' ? safeNet : safeExpense, hideValues)}
              </span>

              {/* Status Badge */}
              {viewMode === 'flow' ? (
                safeInvestment > 0 ? (
                  <div className="flex items-center gap-1.5 mt-1 text-[11px] px-2.5 py-0.5 rounded-full bg-[#6366F1]/15 border border-[#6366F1]/30 text-[#818CF8]">
                    <TrendingUp className="w-3 h-3 text-[#818CF8]" />
                    <span>{formatCurrency(safeInvestment, hideValues)} investidos</span>
                  </div>
                ) : safeNet < 0 ? (
                  <div className="flex items-center gap-1.5 mt-1 text-[11px] px-2.5 py-0.5 rounded-full bg-[#F43F5E]/15 border border-[#F43F5E]/30 text-[#F43F5E]">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Déficit no período</span>
                  </div>
                ) : safeIncome > 0 && safeExpense <= safeIncome ? (
                  <div className="flex items-center gap-1.5 mt-1 text-[11px] px-2.5 py-0.5 rounded-full bg-[#00D2B5]/15 border border-[#00D2B5]/30 text-[#00D2B5]">
                    <Sparkles className="w-3 h-3" />
                    <span>{savingsRate.toFixed(0)}% poupado</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 mt-1 text-[11px] px-2 py-0.5 rounded-full bg-[#131D2F] border border-[#223049] text-slate-400">
                    <span>Sem movimentações</span>
                  </div>
                )
              ) : (
                <div className="flex items-center gap-1 mt-1 text-[11px] px-2.5 py-0.5 rounded-full bg-[#131D2F] border border-[#223049] text-slate-300">
                  <span>{activeCategorySlices.length} categorias</span>
                </div>
              )}

              <span className="text-[10px] text-slate-500 mt-1 font-medium truncate max-w-full">
                {periodScope === 'all' ? 'Todo o Histórico' : selectedMonthName}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Slices Breakdown Legend Bar */}
      <div className="w-full mt-2 pt-3 border-t border-[#1E293B]/70">
        {viewMode === 'flow' ? (
          <div className="grid grid-cols-3 gap-2">
            {/* Receitas */}
            <div 
              onMouseEnter={() => setHoveredSlice(flowSlices.find(s => s.id === 'income') || null)}
              onMouseLeave={() => setHoveredSlice(null)}
              className="flex flex-col items-center p-2 rounded-xl bg-[#0B101D] border border-[#1E293B] hover:border-[#00D2B5]/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <ArrowDownLeft className="w-3 h-3 text-[#00D2B5]" />
                <span>Receitas</span>
              </div>
              <span className="text-xs font-bold font-mono-nums text-[#00D2B5] mt-0.5">
                {formatCurrency(safeIncome, hideValues)}
              </span>
              {totalFlow > 0 && (
                <span className="text-[10px] text-slate-400 font-mono-nums">
                  {((safeIncome / totalFlow) * 100).toFixed(0)}%
                </span>
              )}
            </div>

            {/* Despesas */}
            <div 
              onMouseEnter={() => setHoveredSlice(flowSlices.find(s => s.id === 'expense') || null)}
              onMouseLeave={() => setHoveredSlice(null)}
              className="flex flex-col items-center p-2 rounded-xl bg-[#0B101D] border border-[#1E293B] hover:border-[#F43F5E]/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <ArrowUpRight className="w-3 h-3 text-[#F43F5E]" />
                <span>Despesas</span>
              </div>
              <span className="text-xs font-bold font-mono-nums text-[#F43F5E] mt-0.5">
                {formatCurrency(safeExpense, hideValues)}
              </span>
              {totalFlow > 0 && (
                <span className="text-[10px] text-slate-400 font-mono-nums">
                  {((safeExpense / totalFlow) * 100).toFixed(0)}%
                </span>
              )}
            </div>

            {/* Investimentos */}
            <div 
              onMouseEnter={() => setHoveredSlice(flowSlices.find(s => s.id === 'investment') || null)}
              onMouseLeave={() => setHoveredSlice(null)}
              className="flex flex-col items-center p-2 rounded-xl bg-[#0B101D] border border-[#1E293B] hover:border-[#6366F1]/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <TrendingUp className="w-3 h-3 text-[#6366F1]" />
                <span>Aportes</span>
              </div>
              <span className="text-xs font-bold font-mono-nums text-[#6366F1] mt-0.5">
                {formatCurrency(safeInvestment, hideValues)}
              </span>
              {totalFlow > 0 && safeInvestment > 0 ? (
                <span className="text-[10px] text-slate-400 font-mono-nums">
                  {((safeInvestment / totalFlow) * 100).toFixed(0)}%
                </span>
              ) : (
                <span className="text-[10px] text-slate-600 font-mono-nums">0%</span>
              )}
            </div>
          </div>
        ) : (
          <div>
            {activeCategorySlices.length === 0 ? (
              <p className="text-xs text-center text-slate-500 py-2">
                Nenhuma despesa categorizada no período.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {activeCategorySlices.slice(0, 6).map((slice) => (
                  <div
                    key={slice.id}
                    onMouseEnter={() => setHoveredSlice(slice)}
                    onMouseLeave={() => setHoveredSlice(null)}
                    className="flex flex-col p-1.5 px-2 rounded-lg bg-[#0B101D] border border-[#1E293B] hover:border-slate-500 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-1 text-[10px] text-slate-300 truncate">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: slice.color }} />
                      <span className="truncate">{slice.name}</span>
                    </div>
                    <div className="flex items-center justify-between gap-1 mt-0.5 font-mono-nums">
                      <span className="text-[11px] font-bold text-slate-200">
                        {formatCurrency(slice.value, hideValues)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {slice.percentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Transaction Creation Action Buttons */}
      {onOpenNewTransaction && (
        <div className="w-full grid grid-cols-3 gap-1.5 sm:gap-2 mt-4 pt-3 border-t border-[#1E293B]/70">
          <button
            type="button"
            onClick={() => onOpenNewTransaction('expense')}
            className="p-2 sm:p-2.5 rounded-xl bg-[#090D16] hover:bg-[#131D2E] border border-[#1E293B] hover:border-[#F43F5E]/50 text-slate-300 hover:text-[#F43F5E] text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer group active:scale-95"
          >
            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#F43F5E]/15 flex items-center justify-center text-[#F43F5E] group-hover:scale-110 transition-transform flex-shrink-0">
              <Plus className="w-3 h-3 stroke-[3]" />
            </div>
            <span className="truncate">Despesa</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenNewTransaction('income')}
            className="p-2 sm:p-2.5 rounded-xl bg-[#090D16] hover:bg-[#131D2E] border border-[#1E293B] hover:border-[#00D2B5]/50 text-slate-300 hover:text-[#00D2B5] text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer group active:scale-95"
          >
            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#00D2B5]/15 flex items-center justify-center text-[#00D2B5] group-hover:scale-110 transition-transform flex-shrink-0">
              <Plus className="w-3 h-3 stroke-[3]" />
            </div>
            <span className="truncate">Receita</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenNewTransaction('investment')}
            className="p-2 sm:p-2.5 rounded-xl bg-[#090D16] hover:bg-[#131D2E] border border-[#1E293B] hover:border-[#6366F1]/50 text-slate-300 hover:text-[#818CF8] text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer group active:scale-95"
          >
            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#6366F1]/15 flex items-center justify-center text-[#818CF8] group-hover:scale-110 transition-transform flex-shrink-0">
              <Plus className="w-3 h-3 stroke-[3]" />
            </div>
            <span className="truncate">Aporte</span>
          </button>
        </div>
      )}
    </div>
  );
};
