import React, { useState } from 'react';
import { motion } from 'motion/react';
import { formatCurrency } from '../utils/formatters';
import { ArrowUpRight, ArrowDownLeft, TrendingUp, PieChart, Sparkles } from 'lucide-react';

interface DonutSlice {
  id: string;
  name: string;
  value: number;
  color: string;
  percentage: number;
  type?: string;
}

interface CentralFinancialCircleProps {
  totalIncome: number;
  totalExpense: number;
  totalInvestment: number;
  netBalance: number;
  categorySlices: DonutSlice[];
  hideValues: boolean;
  selectedMonthName: string;
}

export const CentralFinancialCircle: React.FC<CentralFinancialCircleProps> = ({
  totalIncome,
  totalExpense,
  totalInvestment,
  netBalance,
  categorySlices,
  hideValues,
  selectedMonthName,
}) => {
  const [viewMode, setViewMode] = useState<'flow' | 'categories'>('flow');
  const [hoveredSlice, setHoveredSlice] = useState<DonutSlice | null>(null);

  // Flow slices
  const totalFlow = totalIncome + totalExpense + totalInvestment;
  const flowSlices: DonutSlice[] = [
    {
      id: 'income',
      name: 'Receitas',
      value: totalIncome,
      color: '#00D2B5', // TradeMap cyan
      percentage: totalFlow > 0 ? (totalIncome / totalFlow) * 100 : 0,
      type: 'income',
    },
    {
      id: 'expense',
      name: 'Despesas',
      value: totalExpense,
      color: '#F43F5E', // Rose / Red
      percentage: totalFlow > 0 ? (totalExpense / totalFlow) * 100 : 0,
      type: 'expense',
    },
    {
      id: 'investment',
      name: 'Investimentos',
      value: totalInvestment,
      color: '#6366F1', // Indigo / Purple
      percentage: totalFlow > 0 ? (totalInvestment / totalFlow) * 100 : 0,
      type: 'investment',
    },
  ].filter(s => s.value > 0);

  const activeSlices = viewMode === 'flow' ? flowSlices : (categorySlices.length > 0 ? categorySlices : flowSlices);

  // SVG Geometry
  const size = 300;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate cumulative offsets
  let accumulatedPercent = 0;
  const svgArcs = activeSlices.map(slice => {
    const strokeDasharray = `${(slice.percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
    accumulatedPercent += slice.percentage;
    return {
      ...slice,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  const savingsRate = totalIncome > 0 ? Math.max(0, ((totalIncome - totalExpense) / totalIncome) * 100) : 0;

  return (
    <div id="central-financial-circle-card" className="bg-[#0D1424]/90 border border-[#1E293B] rounded-2xl p-6 relative overflow-hidden backdrop-blur-md shadow-xl flex flex-col items-center">
      {/* Background ambient glow TradeMap style */}
      <div className="absolute -top-16 -left-16 w-52 h-52 bg-[#00D2B5]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-52 h-52 bg-[#0F3246]/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar of the widget */}
      <div className="w-full flex items-center justify-between mb-4 z-10">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00D2B5] shadow-[0_0_8px_#00D2B5]" />
          <h2 className="text-sm font-semibold tracking-wider text-slate-300 uppercase">
            Radar Financeiro Central
          </h2>
        </div>

        {/* View mode toggle */}
        <div className="flex bg-[#090D16] p-1 rounded-lg border border-[#1E293B] text-xs">
          <button
            type="button"
            onClick={() => setViewMode('flow')}
            className={`px-3 py-1 rounded font-medium transition-all ${
              viewMode === 'flow'
                ? 'bg-[#00D2B5] text-[#090D16] shadow-sm font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Fluxo Geral
          </button>
          <button
            type="button"
            onClick={() => setViewMode('categories')}
            className={`px-3 py-1 rounded font-medium transition-all ${
              viewMode === 'categories'
                ? 'bg-[#00D2B5] text-[#090D16] shadow-sm font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Por Categoria
          </button>
        </div>
      </div>

      {/* The Central Circular Display */}
      <div className="relative my-3 flex items-center justify-center">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="rotate-[-90deg] transition-all duration-300"
        >
          {/* Base track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#151E2E"
            strokeWidth={strokeWidth}
          />

          {/* Render segments */}
          {svgArcs.map((arc) => {
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
                strokeLinecap="round"
                className="transition-all duration-300 cursor-pointer"
                style={{
                  filter: isHovered ? `drop-shadow(0 0 10px ${arc.color})` : undefined,
                  opacity: hoveredSlice && !isHovered ? 0.35 : 1,
                }}
                onMouseEnter={() => setHoveredSlice(arc)}
                onMouseLeave={() => setHoveredSlice(null)}
              />
            );
          })}
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 pointer-events-none">
          {hoveredSlice ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center"
            >
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                {hoveredSlice.name}
              </span>
              <span className="text-xl font-bold font-mono-nums mt-0.5" style={{ color: hoveredSlice.color }}>
                {formatCurrency(hoveredSlice.value, hideValues)}
              </span>
              <span className="text-xs px-2 py-0.5 mt-1 rounded bg-[#090D16] border border-[#1E293B] font-mono-nums text-slate-300">
                {hoveredSlice.percentage.toFixed(1)}% do total
              </span>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                Resultado Líquido
              </span>
              <span
                className={`text-2xl font-extrabold font-mono-nums tracking-tight my-0.5 ${
                  netBalance >= 0 ? 'text-[#00D2B5]' : 'text-[#F43F5E]'
                }`}
              >
                {netBalance >= 0 ? '+' : ''}{formatCurrency(netBalance, hideValues)}
              </span>
              <div className="flex items-center gap-1.5 mt-1 text-[11px] px-2.5 py-0.5 rounded-full bg-[#131D2F] border border-[#223049] text-slate-300">
                <Sparkles className="w-3 h-3 text-[#00D2B5]" />
                <span>{savingsRate.toFixed(0)}% poupado</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 font-medium">
                {selectedMonthName}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Slices legend */}
      <div className="w-full mt-4 pt-4 border-t border-[#1E293B]/70 grid grid-cols-3 gap-2">
        {viewMode === 'flow' ? (
          <>
            <div 
              onMouseEnter={() => setHoveredSlice(flowSlices.find(s => s.id === 'income') || null)}
              onMouseLeave={() => setHoveredSlice(null)}
              className="flex flex-col items-center p-2 rounded-xl bg-[#0B101D] border border-[#1E293B] hover:border-[#00D2B5]/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <ArrowDownLeft className="w-3 h-3 text-[#00D2B5]" />
                <span>Receitas</span>
              </div>
              <span className="text-xs font-bold font-mono-nums text-[#00D2B5] mt-1">
                {formatCurrency(totalIncome, hideValues)}
              </span>
            </div>

            <div 
              onMouseEnter={() => setHoveredSlice(flowSlices.find(s => s.id === 'expense') || null)}
              onMouseLeave={() => setHoveredSlice(null)}
              className="flex flex-col items-center p-2 rounded-xl bg-[#0B101D] border border-[#1E293B] hover:border-[#F43F5E]/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <ArrowUpRight className="w-3 h-3 text-[#F43F5E]" />
                <span>Despesas</span>
              </div>
              <span className="text-xs font-bold font-mono-nums text-[#F43F5E] mt-1">
                {formatCurrency(totalExpense, hideValues)}
              </span>
            </div>

            <div 
              onMouseEnter={() => setHoveredSlice(flowSlices.find(s => s.id === 'investment') || null)}
              onMouseLeave={() => setHoveredSlice(null)}
              className="flex flex-col items-center p-2 rounded-xl bg-[#0B101D] border border-[#1E293B] hover:border-[#6366F1]/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <TrendingUp className="w-3 h-3 text-[#6366F1]" />
                <span>Aportes</span>
              </div>
              <span className="text-xs font-bold font-mono-nums text-[#6366F1] mt-1">
                {formatCurrency(totalInvestment, hideValues)}
              </span>
            </div>
          </>
        ) : (
          categorySlices.slice(0, 3).map((slice) => (
            <div
              key={slice.id}
              onMouseEnter={() => setHoveredSlice(slice)}
              onMouseLeave={() => setHoveredSlice(null)}
              className="flex flex-col items-center p-2 rounded-xl bg-[#0B101D] border border-[#1E293B] hover:border-slate-500 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1 text-[11px] text-slate-400 truncate max-w-full">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: slice.color }} />
                <span className="truncate">{slice.name}</span>
              </div>
              <span className="text-xs font-bold font-mono-nums text-slate-200 mt-1">
                {formatCurrency(slice.value, hideValues)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
