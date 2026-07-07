/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Sparkles, Check, ChevronRight, Lock } from 'lucide-react';
import { PetState, FOOD_ITEMS, COSMIC_ACCESSORIES, FoodItem, CosmicAccessory } from '../types';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  petState: PetState;
  onPurchaseFood: (food: FoodItem) => void;
  onPurchaseAccessory: (accessory: CosmicAccessory) => void;
  onEquipItem: (id: string, type: 'skin' | 'accessory') => void;
}

export default function ShopModal({
  isOpen,
  onClose,
  petState,
  onPurchaseFood,
  onPurchaseAccessory,
  onEquipItem,
}: ShopModalProps) {
  const [activeTab, setActiveTab] = useState<'food' | 'cosmetics'>('food');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
        {/* Modal Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-slate-950/90 border border-white/10 backdrop-blur-2xl rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-white/10 bg-black/40 flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-violet-400" />
              <h2 className="font-display font-bold text-base text-white uppercase tracking-wider">Loja Estelar & Guarda-Roupa</h2>
            </div>
            
            {/* Coin balance */}
            <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
              <span className="text-sm">🪙</span>
              <span className="font-mono text-sm font-bold text-amber-400">{petState.coins}</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-colors text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-black/20 p-2 border-b border-white/5">
            <button
              onClick={() => setActiveTab('food')}
              className={`flex-1 py-2 text-center rounded-xl font-display font-bold text-xs tracking-wider uppercase transition-all cursor-pointer ${
                activeTab === 'food'
                  ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.15)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              🥗 Comidas & Poções
            </button>
            <button
              onClick={() => setActiveTab('cosmetics')}
              className={`flex-1 py-2 text-center rounded-xl font-display font-bold text-xs tracking-wider uppercase transition-all cursor-pointer ${
                activeTab === 'cosmetics'
                  ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.15)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              👑 Roupas & Visuais
            </button>
          </div>

          {/* Tab Content (Scrollable) */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            
            {/* 1. FOOD TAB */}
            {activeTab === 'food' && (
              <div className="space-y-3.5">
                <div className="text-slate-400 text-[11px] font-mono uppercase tracking-wider mb-2">
                  Alimente seu bichinho imediatamente comprando guloseimas cósmicas:
                </div>
                {FOOD_ITEMS.map((food) => {
                  const isFree = food.cost === 0;
                  const canAfford = petState.coins >= food.cost;
                  
                  return (
                    <div
                      key={food.id}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-violet-500/40 hover:bg-white/10 transition-all group"
                    >
                      {/* Left: icon & details */}
                      <div className="flex items-center gap-3.5">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${food.color} shadow-lg flex items-center justify-center text-2xl group-hover:scale-105 transition-transform`}>
                          {food.icon}
                        </div>
                        <div>
                          <div className="font-display font-semibold text-sm text-slate-100 flex items-center gap-1.5">
                            {food.name}
                            {isFree && (
                              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 uppercase font-mono font-bold">
                                Grátis
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 max-w-[240px] leading-relaxed mt-0.5">
                            {food.description}
                          </p>
                          {/* Stats benefits tags */}
                          <div className="flex gap-2 mt-1.5">
                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                              🍔 +{food.hungerGain} Fome
                            </span>
                            {food.energyGain !== 0 && (
                              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                                food.energyGain > 0 ? 'text-yellow-400 bg-yellow-500/10' : 'text-red-400 bg-red-500/10'
                              }`}>
                                ⚡ {food.energyGain > 0 ? '+' : ''}{food.energyGain} Energia
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: action / buy button */}
                      <button
                        onClick={() => {
                          if (canAfford || isFree) onPurchaseFood(food);
                        }}
                        disabled={!canAfford && !isFree}
                        className={`px-4 py-2 rounded-xl font-display font-bold text-xs tracking-wide flex items-center gap-1 transition-all cursor-pointer ${
                          isFree
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                            : canAfford
                            ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-md'
                            : 'bg-white/5 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {!isFree && <span className="text-sm">🪙</span>}
                        {isFree ? 'Alimentar' : `${food.cost}`}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 2. COSMETICS TAB */}
            {activeTab === 'cosmetics' && (
              <div className="space-y-6">
                
                {/* SKINS SECTION */}
                <div className="space-y-3">
                  <div className="text-slate-400 text-[11px] font-mono uppercase tracking-wider">
                    🎨 Visuais de Pele:
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {COSMIC_ACCESSORIES.filter((a) => a.type === 'skin').map((acc) => {
                      const isUnlocked = petState.unlockedSkins.includes(acc.id);
                      const isEquipped = petState.currentSkin === acc.id;
                      const canAfford = petState.coins >= acc.cost;

                      return (
                        <div
                          key={acc.id}
                          className={`p-3.5 rounded-2xl border flex flex-col justify-between h-40 transition-all ${
                            isEquipped
                              ? 'border-violet-500 bg-violet-500/10 shadow-[0_0_15px_rgba(139,92,246,0.15)] ring-1 ring-violet-500/20'
                              : isUnlocked
                              ? 'border-white/10 bg-white/5 hover:border-white/20'
                              : 'border-white/5 bg-white/[0.02] opacity-70'
                          }`}
                        >
                          <div>
                            {/* Visual preview dot */}
                            <div className="flex justify-between items-start mb-2">
                              <div
                                className="w-5 h-5 rounded-full border border-white/20 shadow-md animate-pulse"
                                style={{ backgroundColor: acc.color }}
                              />
                              {!isUnlocked && (
                                <Lock className="w-3.5 h-3.5 text-slate-500" />
                              )}
                            </div>
                            <h3 className="font-display font-bold text-xs text-slate-200">
                              {acc.name}
                            </h3>
                            <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-normal">
                              {acc.description}
                            </p>
                          </div>

                          {/* Action Button */}
                          <div className="mt-3">
                            {isEquipped ? (
                              <div className="w-full py-1.5 rounded-lg bg-violet-600/20 text-violet-400 border border-violet-500/20 flex items-center justify-center gap-1 text-[11px] font-bold">
                                <Check className="w-3.5 h-3.5" /> Equipado
                              </div>
                            ) : isUnlocked ? (
                              <button
                                onClick={() => onEquipItem(acc.id, 'skin')}
                                className="w-full py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white border border-white/10 hover:border-white/20 font-display font-bold text-[11px] transition-colors cursor-pointer"
                              >
                                Equipar
                              </button>
                            ) : (
                              <button
                                onClick={() => onPurchaseAccessory(acc)}
                                disabled={!canAfford}
                                className={`w-full py-1.5 rounded-lg font-display font-bold text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer ${
                                  canAfford
                                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-sm'
                                    : 'bg-white/5 text-slate-500 cursor-not-allowed'
                                }`}
                              >
                                🪙 {acc.cost}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ACCESSORIES SECTION */}
                <div className="space-y-3">
                  <div className="text-slate-400 text-[11px] font-mono uppercase tracking-wider">
                    👓 Chapéus e Equipamentos:
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {COSMIC_ACCESSORIES.filter((a) => a.type === 'accessory').map((acc) => {
                      const isUnlocked = petState.unlockedAccessories.includes(acc.id) || acc.id === 'acc_none';
                      const isEquipped = petState.currentAccessory === acc.id;
                      const canAfford = petState.coins >= acc.cost;

                      return (
                        <div
                          key={acc.id}
                          className={`p-3.5 rounded-2xl border flex flex-col justify-between h-40 transition-all ${
                            isEquipped
                              ? 'border-violet-500 bg-violet-500/10 shadow-[0_0_15px_rgba(139,92,246,0.15)] ring-1 ring-violet-500/20'
                              : isUnlocked
                              ? 'border-white/10 bg-white/5 hover:border-white/20'
                              : 'border-white/5 bg-white/[0.02] opacity-70'
                          }`}
                        >
                          <div>
                            <div className="flex justify-between items-start mb-2">
                              {/* Small placeholder item icon indicator */}
                              <span className="text-base select-none">
                                {acc.id === 'acc_none' ? '❌' : acc.id === 'acc_glasses' ? '👓' : acc.id === 'acc_crown' ? '👑' : acc.id === 'acc_helmet' ? '🧑‍🚀' : acc.id === 'acc_headphones' ? '🎧' : '🎀'}
                              </span>
                              {!isUnlocked && (
                                <Lock className="w-3.5 h-3.5 text-slate-500" />
                              )}
                            </div>
                            <h3 className="font-display font-bold text-xs text-slate-200">
                              {acc.name}
                            </h3>
                            <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-normal">
                              {acc.description}
                            </p>
                          </div>

                          {/* Action Button */}
                          <div className="mt-3">
                            {isEquipped ? (
                              <div className="w-full py-1.5 rounded-lg bg-violet-600/20 text-violet-400 border border-violet-500/20 flex items-center justify-center gap-1 text-[11px] font-bold">
                                <Check className="w-3.5 h-3.5" /> Equipado
                              </div>
                            ) : isUnlocked ? (
                              <button
                                onClick={() => onEquipItem(acc.id, 'accessory')}
                                className="w-full py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white border border-white/10 hover:border-white/20 font-display font-bold text-[11px] transition-colors cursor-pointer"
                              >
                                Equipar
                              </button>
                            ) : (
                              <button
                                onClick={() => onPurchaseAccessory(acc)}
                                disabled={!canAfford}
                                className={`w-full py-1.5 rounded-lg font-display font-bold text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer ${
                                  canAfford
                                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-sm'
                                    : 'bg-white/5 text-slate-500 cursor-not-allowed'
                                }`}
                              >
                                🪙 {acc.cost}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* Footer Info */}
          <div className="p-4 border-t border-white/10 bg-black/40 text-center text-[10px] text-slate-500">
            Minijogos dão moedas! Jogue os minijogos para expandir o guarda-roupa espacial do seu bichinho.
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
