/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Utensils, ShowerHead, Gamepad2, Zap } from 'lucide-react';
import { PetState } from '../types';

interface StatsBarProps {
  petState: PetState;
}

export default function StatsBar({ petState }: StatsBarProps) {
  const { hunger, hygiene, fun, energy } = petState;

  const getBarColor = (val: number, type: 'hunger' | 'hygiene' | 'fun' | 'energy') => {
    if (val < 25) {
      return 'bg-gradient-to-r from-red-500 to-rose-600 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.5)]';
    }
    if (val < 50) {
      return 'bg-gradient-to-r from-amber-500 to-orange-500';
    }
    switch (type) {
      case 'hunger':
        return 'bg-gradient-to-r from-emerald-400 to-teal-500';
      case 'hygiene':
        return 'bg-gradient-to-r from-cyan-400 to-sky-500';
      case 'fun':
        return 'bg-gradient-to-r from-pink-400 to-fuchsia-500';
      case 'energy':
        return 'bg-gradient-to-r from-amber-300 to-yellow-500';
    }
  };

  const stats = [
    {
      id: 'hunger',
      label: 'Nutrição (Fome)',
      value: hunger,
      icon: Utensils,
      textStyle: 'text-emerald-400',
      bgStyle: 'bg-black/30 border-white/10 hover:border-emerald-500/30',
      desc: hunger < 25 ? 'Com muita fome!' : hunger > 80 ? 'Saciado' : 'Satisfeito',
    },
    {
      id: 'hygiene',
      label: 'Higiene (Banho)',
      value: hygiene,
      icon: ShowerHead,
      textStyle: 'text-cyan-400',
      bgStyle: 'bg-black/30 border-white/10 hover:border-cyan-500/30',
      desc: hygiene < 25 ? 'Precisa de banho!' : hygiene > 80 ? 'Brilhando!' : 'Limpo',
    },
    {
      id: 'fun',
      label: 'Diversão (Brincar)',
      value: fun,
      icon: Gamepad2,
      textStyle: 'text-fuchsia-400',
      bgStyle: 'bg-black/30 border-white/10 hover:border-fuchsia-500/30',
      desc: fun < 25 ? 'Entediado...' : fun > 80 ? 'Super Alegre!' : 'Contente',
    },
    {
      id: 'energy',
      label: 'Energia (Dormir)',
      value: energy,
      icon: Zap,
      textStyle: 'text-yellow-400',
      bgStyle: 'bg-black/30 border-white/10 hover:border-yellow-500/30',
      desc: energy < 20 ? 'Exausto!' : energy > 80 ? 'Cheio de energia' : 'Ativo',
    },
  ] as const;

  return (
    <div 
      id="status_bars_grid"
      className="grid grid-cols-2 gap-3"
    >
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.id}
            className={`flex flex-col p-3 rounded-2xl border backdrop-blur-sm transition-all duration-300 ${stat.bgStyle} ${
              stat.value < 25 ? 'ring-1 ring-red-500/30 bg-red-950/10' : ''
            }`}
          >
            {/* Header info */}
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Icon className={`w-4 h-4 ${stat.textStyle}`} />
                <span className="font-display font-medium text-xs text-slate-200">
                  {stat.label}
                </span>
              </div>
              <span className={`font-mono text-xs font-bold ${stat.textStyle}`}>
                {stat.value}%
              </span>
            </div>

            {/* Progress bar line */}
            <div className="h-2 w-full bg-slate-900/60 rounded-full overflow-hidden p-0.5 border border-slate-800/40">
              <motion.div
                className={`h-full rounded-full transition-all duration-500 ${getBarColor(stat.value, stat.id)}`}
                initial={{ width: 0 }}
                animate={{ width: `${stat.value}%` }}
              />
            </div>

            {/* Helpful short status description */}
            <div className="mt-1.5 flex justify-between items-center">
              <span className="text-[10px] text-slate-400 font-sans truncate max-w-[80%]">
                {stat.desc}
              </span>
              {stat.value < 25 && (
                <motion.span
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="text-[9px] text-red-400 font-mono font-bold tracking-wider"
                >
                  CRÍTICO
                </motion.span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
