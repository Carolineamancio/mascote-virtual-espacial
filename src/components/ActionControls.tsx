/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Utensils, ShowerHead, Gamepad2, Moon, Sun, ShoppingBag, Sparkles } from 'lucide-react';
import { PetState, FOOD_ITEMS, FoodItem } from '../types';

interface ActionControlsProps {
  petState: PetState;
  activeAction: 'none' | 'feeding' | 'bathing' | 'playing' | 'petted';
  activeSubTray: 'none' | 'food' | 'play';
  onToggleSubTray: (tray: 'food' | 'play') => void;
  onFeed: (food: FoodItem) => void;
  onStartBath: () => void;
  onToggleSleep: () => void;
  onOpenShop: () => void;
  onSelectMinigame: (gameType: 'catcher' | 'memory') => void;
}

export default function ActionControls({
  petState,
  activeAction,
  activeSubTray,
  onToggleSubTray,
  onFeed,
  onStartBath,
  onToggleSleep,
  onOpenShop,
  onSelectMinigame,
}: ActionControlsProps) {
  const { isSleeping, coins } = petState;

  return (
    <div id="action_controls_container" className="flex flex-col gap-3.5">
      {/* Primary Action Buttons Bar */}
      <div className="grid grid-cols-5 gap-2.5">
        
        {/* FEED BUTTON */}
        <button
          onClick={() => {
            if (isSleeping) return;
            onToggleSubTray('food');
          }}
          disabled={isSleeping}
          className={`flex flex-col items-center justify-center py-3.5 px-2 rounded-2xl border transition-all ${
            isSleeping
              ? 'bg-white/2 border-white/5 text-slate-600 cursor-not-allowed opacity-30'
              : activeSubTray === 'food'
              ? 'bg-blue-500/20 border-blue-400 text-blue-300 ring-2 ring-blue-500/10'
              : 'bg-white/5 border-white/10 hover:bg-blue-500/10 hover:border-blue-500/40 text-slate-300 hover:text-blue-300'
          }`}
        >
          <Utensils className="w-5 h-5 mb-1" />
          <span className="font-display font-bold text-[10px] uppercase tracking-wider">Alimentar</span>
        </button>

        {/* SHOWER / BATH BUTTON */}
        <button
          onClick={() => {
            if (isSleeping) return;
            onStartBath();
          }}
          disabled={isSleeping || activeAction === 'bathing'}
          className={`flex flex-col items-center justify-center py-3.5 px-2 rounded-2xl border transition-all ${
            isSleeping || activeAction === 'bathing'
              ? 'bg-white/2 border-white/5 text-slate-600 cursor-not-allowed opacity-30'
              : 'bg-white/5 border-white/10 hover:bg-cyan-500/10 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300'
          }`}
        >
          <ShowerHead className={`w-5 h-5 mb-1 ${activeAction === 'bathing' ? 'animate-bounce text-cyan-400' : ''}`} />
          <span className="font-display font-bold text-[10px] uppercase tracking-wider">Banho</span>
        </button>

        {/* PLAY / MINIGAMES BUTTON */}
        <button
          onClick={() => {
            if (isSleeping) return;
            onToggleSubTray('play');
          }}
          disabled={isSleeping}
          className={`flex flex-col items-center justify-center py-3.5 px-2 rounded-2xl border transition-all ${
            isSleeping
              ? 'bg-white/2 border-white/5 text-slate-600 cursor-not-allowed opacity-30'
              : activeSubTray === 'play'
              ? 'bg-pink-500/20 border-pink-400 text-pink-300 ring-2 ring-pink-500/10'
              : 'bg-white/5 border-white/10 hover:bg-pink-500/10 hover:border-pink-500/40 text-slate-300 hover:text-pink-300'
          }`}
        >
          <Gamepad2 className="w-5 h-5 mb-1" />
          <span className="font-display font-bold text-[10px] uppercase tracking-wider">Brincar</span>
        </button>

        {/* SLEEP TOGGLE BUTTON */}
        <button
          onClick={onToggleSleep}
          className={`flex flex-col items-center justify-center py-3.5 px-2 rounded-2xl border transition-all ${
            isSleeping
              ? 'bg-indigo-500/25 border-indigo-500 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.2)] animate-pulse'
              : 'bg-white/5 border-white/10 hover:bg-indigo-500/10 hover:border-indigo-500/40 text-slate-300 hover:text-indigo-300'
          }`}
        >
          {isSleeping ? <Sun className="w-5 h-5 mb-1" /> : <Moon className="w-5 h-5 mb-1" />}
          <span className="font-display font-bold text-[10px] uppercase tracking-wider">
            {isSleeping ? 'Acordar' : 'Dormir'}
          </span>
        </button>

        {/* SHOP MODAL TRIGGER */}
        <button
          onClick={onOpenShop}
          className="flex flex-col items-center justify-center py-3.5 px-2 rounded-2xl border bg-white/5 border-white/10 hover:border-violet-400 hover:bg-violet-600/10 hover:text-violet-300 text-slate-300 transition-all group"
        >
          <ShoppingBag className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
          <span className="font-display font-bold text-[10px] uppercase tracking-wider">Loja</span>
        </button>

      </div>

      {/* Action Sub-Trays with Framer Motion slide effects */}
      <AnimatePresence mode="wait">
        
        {/* 1. FOOD TRAY DRAWER */}
        {activeSubTray === 'food' && !isSleeping && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-black/40 border border-white/10 backdrop-blur-xl rounded-2xl p-3 flex flex-col gap-2">
              <span className="text-[10px] text-slate-400 font-mono tracking-wide uppercase px-1">
                Selecione um alimento (Bala Estelar é sempre gratuita):
              </span>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {FOOD_ITEMS.map((food) => {
                  const isFree = food.cost === 0;
                  const canAfford = coins >= food.cost;

                  return (
                    <button
                      key={food.id}
                      onClick={() => {
                        if (canAfford || isFree) onFeed(food);
                      }}
                      disabled={!canAfford && !isFree}
                      className={`flex-none w-28 p-2 rounded-xl border flex flex-col items-center justify-between transition-all select-none ${
                        isFree 
                          ? 'bg-white/5 border-white/10 hover:border-emerald-500/40 text-slate-200' 
                          : canAfford 
                          ? 'bg-white/5 border-white/10 hover:border-blue-400 text-slate-200' 
                          : 'bg-white/2 border-transparent text-slate-600 opacity-40 cursor-not-allowed'
                      }`}
                    >
                      <span className="text-xl">{food.icon}</span>
                      <span className="font-display font-semibold text-[10px] text-slate-200 mt-1 truncate w-full text-center">
                        {food.name}
                      </span>
                      {/* Price indicator */}
                      <span className="text-[9px] font-mono font-bold text-amber-400 mt-1 flex items-center gap-0.5">
                        {isFree ? 'FOME +' + food.hungerGain : `🪙 ${food.cost}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* 2. PLAY TRAY DRAWER */}
        {activeSubTray === 'play' && !isSleeping && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-black/40 border border-white/10 backdrop-blur-xl rounded-2xl p-3.5 flex flex-col gap-2.5">
              <span className="text-[10px] text-slate-400 font-mono tracking-wide uppercase">
                Escolha um minijogo espacial para jogar com seu mascote:
              </span>
              
              <div className="grid grid-cols-2 gap-2.5">
                {/* GAME 1 */}
                <button
                  onClick={() => onSelectMinigame('catcher')}
                  className="p-3 bg-white/5 border border-white/10 hover:border-pink-500/40 rounded-xl text-left transition-all flex items-center gap-3 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-pink-500/10 flex items-center justify-center text-xl">
                    ⭐
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-xs text-slate-100 group-hover:text-pink-300 transition-colors">
                      Papa-Estrelas
                    </h4>
                    <p className="text-[10px] text-slate-400 leading-normal mt-0.5">Pegue estrelas caídas</p>
                  </div>
                </button>

                {/* GAME 2 */}
                <button
                  onClick={() => onSelectMinigame('memory')}
                  className="p-3 bg-white/5 border border-white/10 hover:border-purple-500/40 rounded-xl text-left transition-all flex items-center gap-3 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center text-xl">
                    🧩
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-xs text-slate-100 group-hover:text-purple-300 transition-colors">
                      Memória Cósmica
                    </h4>
                    <p className="text-[10px] text-slate-400 leading-normal mt-0.5">Encontre os pares cósmicos</p>
                  </div>
                </button>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
