/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Gamepad2, RefreshCw, X, Play, HelpCircle, CheckCircle2 } from 'lucide-react';
import { PetState } from '../types';

interface MinigameMemoryProps {
  petState: PetState;
  onFinishGame: (coinsEarned: number, funBoost: number, xpEarned: number) => void;
  onClose: () => void;
}

interface Card {
  id: number;
  symbol: string;
  color: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const COSMIC_SYMBOLS = [
  { symbol: '🚀', color: 'bg-indigo-500/10 border-indigo-500/40 text-indigo-400' },
  { symbol: '🛸', color: 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400' },
  { symbol: '🪐', color: 'bg-amber-500/10 border-amber-500/40 text-amber-400' },
  { symbol: '🌙', color: 'bg-purple-500/10 border-purple-500/40 text-purple-400' },
  { symbol: '☄️', color: 'bg-rose-500/10 border-rose-500/40 text-rose-400' },
  { symbol: '⭐', color: 'bg-yellow-500/10 border-yellow-500/40 text-yellow-400' },
];

export default function MinigameMemory({
  petState,
  onFinishGame,
  onClose,
}: MinigameMemoryProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [coinsReward, setCoinsReward] = useState(0);

  // Initialize cards
  const initializeGame = () => {
    // Duplicate symbols to make pairs
    const doubleSymbols = [...COSMIC_SYMBOLS, ...COSMIC_SYMBOLS];
    // Shuffle cards
    const shuffled = doubleSymbols
      .map((item, index) => ({
        id: index,
        symbol: item.symbol,
        color: item.color,
        isFlipped: false,
        isMatched: false,
      }))
      .sort(() => Math.random() - 0.5);

    setCards(shuffled);
    setFlippedIndices([]);
    setMoves(0);
    setMatches(0);
    setGameOver(false);
    setIsPlaying(true);
  };

  const handleCardClick = (clickedIndex: number) => {
    // Ignore clicks if 2 cards are already flipped, or if card is already matched/flipped
    if (flippedIndices.length >= 2) return;
    if (cards[clickedIndex].isFlipped || cards[clickedIndex].isMatched) return;

    // Flip the clicked card
    const updatedCards = [...cards];
    updatedCards[clickedIndex].isFlipped = true;
    setCards(updatedCards);

    const newFlipped = [...flippedIndices, clickedIndex];
    setFlippedIndices(newFlipped);

    // If we have flipped 2 cards, check match
    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [firstIdx, secondIdx] = newFlipped;

      if (cards[firstIdx].symbol === cards[secondIdx].symbol) {
        // MATCH FOUND
        setTimeout(() => {
          setCards((prev) => {
            const next = [...prev];
            next[firstIdx].isMatched = true;
            next[secondIdx].isMatched = true;
            return next;
          });
          setMatches((prevMatches) => {
            const nextMatches = prevMatches + 1;
            if (nextMatches === COSMIC_SYMBOLS.length) {
              triggerWin();
            }
            return nextMatches;
          });
          setFlippedIndices([]);
        }, 500);
      } else {
        // MISMATCH - Flip back after delay
        setTimeout(() => {
          setCards((prev) => {
            const next = [...prev];
            next[firstIdx].isFlipped = false;
            next[secondIdx].isFlipped = false;
            return next;
          });
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  const triggerWin = () => {
    // Coins logic: base is 15 coins, minus moves penalty, min 10 coins, max 30
    const calculatedCoins = Math.max(12, 35 - Math.floor(moves / 1.5));
    setCoinsReward(calculatedCoins);
    setGameOver(true);
  };

  const handleFinish = () => {
    // Reward loop: grant stats
    const funBoost = Math.min(30 + Math.max(0, 10 - Math.floor(moves / 3)), 60);
    const xpEarned = 20 + Math.max(0, 15 - Math.floor(moves / 2));
    onFinishGame(coinsReward, funBoost, xpEarned);
    setIsPlaying(false);
    setGameOver(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between h-full relative overflow-hidden">
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-48 h-0.5 bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />

      {/* Minigame Header */}
      <div className="flex justify-between items-center mb-4 z-10">
        <div className="flex items-center gap-2">
          <Gamepad2 className="w-5 h-5 text-violet-400" />
          <span className="font-display font-bold text-sm text-slate-100">Mini-jogo: Memória Cósmica</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-slate-400 hover:text-white"
        >
          <X className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Active Area */}
      <div className="relative w-full h-[280px] rounded-2xl bg-[#060613] border border-slate-800 overflow-hidden flex flex-col justify-center items-center">
        {!isPlaying && !gameOver ? (
          // LOBBY / TUTORIAL SCREEN
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-[#070714]/90">
            <div className="w-14 h-14 rounded-full bg-violet-600/10 border border-violet-500/30 flex items-center justify-center text-3xl mb-3 animate-pulse">
              🧩
            </div>
            <h3 className="font-display font-bold text-base text-white">Memória Cósmica</h3>
            <p className="text-xs text-slate-400 max-w-xs mt-1.5 leading-relaxed">
              Encontre os pares de símbolos galácticos escondidos. Quanto menos jogadas usar, mais moedas ganhará!
            </p>
            
            <div className="mt-4 flex flex-col gap-1.5 text-[10px] text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
              <span className="flex items-center gap-1.5">🌌 Tabuleiro: 12 Cartas (6 Pares)</span>
              <span className="flex items-center gap-1.5">⚡ Menos Jogadas = Recompensa de Moedas maior</span>
            </div>

            <button
              onClick={initializeGame}
              className="mt-5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-display font-bold text-xs tracking-wider px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-lg hover:scale-105 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" /> COMEÇAR
            </button>
          </div>
        ) : gameOver ? (
          // GAME OVER SUMMARY SCREEN
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-[#070714]/95">
            <div className="w-12 h-12 rounded-full bg-emerald-500/15 flex items-center justify-center text-2xl mb-2 animate-bounce">
              🏆
            </div>
            <h3 className="font-display font-bold text-lg text-emerald-400 uppercase tracking-wide">Tabuleiro Completo!</h3>
            <p className="text-xs text-slate-400 mt-1">Sua mente está afiada como uma supernova!</p>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">Completado em {moves} jogadas</p>

            {/* Stat Gains Display */}
            <div className="grid grid-cols-3 gap-3 my-4 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 w-full max-w-xs">
              <div className="flex flex-col items-center">
                <span className="text-lg">🪙</span>
                <span className="font-mono text-xs font-bold text-amber-400">+{coinsReward}</span>
                <span className="text-[9px] text-slate-400 font-sans">Moedas</span>
              </div>
              <div className="flex flex-col items-center border-x border-slate-800">
                <span className="text-lg">✨</span>
                <span className="font-mono text-xs font-bold text-purple-400">+{20 + Math.max(0, 15 - Math.floor(moves / 2))}</span>
                <span className="text-[9px] text-slate-400 font-sans">XP</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-lg">🎡</span>
                <span className="font-mono text-xs font-bold text-pink-400">+{Math.min(30 + Math.max(0, 10 - Math.floor(moves / 3)), 60)}%</span>
                <span className="text-[9px] text-slate-400 font-sans">Diversão</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={initializeGame}
                className="bg-slate-800 hover:bg-slate-700 text-white font-display font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Jogar Novamente
              </button>
              <button
                onClick={handleFinish}
                className="bg-violet-600 hover:bg-violet-500 text-white font-display font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all"
              >
                Pegar Recompensas
              </button>
            </div>
          </div>
        ) : (
          // ACTIVE GAMEPLAY GRID
          <div className="w-full h-full flex flex-col justify-between p-3.5">
            {/* Live stats */}
            <div className="flex justify-between items-center text-xs text-slate-400 px-1 font-mono">
              <span>Jogadas: <b className="text-white">{moves}</b></span>
              <span>Pares: <b className="text-violet-400">{matches}/6</b></span>
            </div>

            {/* Grid 4x3 */}
            <div className="grid grid-cols-4 gap-2.5 my-auto justify-center">
              {cards.map((card, idx) => (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(idx)}
                  className="h-14 aspect-square cursor-pointer select-none perspective-500"
                >
                  <motion.div
                    className="relative w-full h-full duration-500 preserve-3d"
                    animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
                  >
                    {/* Front side (Unflipped / card back) */}
                    <div className="absolute inset-0 backface-hidden bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center hover:border-violet-500/50 shadow-md transition-colors">
                      <HelpCircle className="w-5 h-5 text-slate-600" />
                    </div>

                    {/* Back side (Flipped symbol) */}
                    <div
                      className={`absolute inset-0 backface-hidden transform-rotate-y-180 border rounded-xl flex items-center justify-center text-2xl shadow-inner ${
                        card.isMatched 
                          ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-400 opacity-90' 
                          : card.color
                      }`}
                    >
                      {card.isMatched ? (
                        <span className="relative">
                          {card.symbol}
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 absolute -top-1.5 -right-1.5 fill-slate-950" />
                        </span>
                      ) : (
                        card.symbol
                      )}
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>

            {/* Quick reset button */}
            <div className="flex justify-center">
              <button
                onClick={initializeGame}
                className="flex items-center gap-1 font-mono text-[10px] text-slate-500 hover:text-slate-300 bg-slate-950/50 border border-slate-900 px-2.5 py-0.5 rounded-full transition-colors"
              >
                <RefreshCw className="w-2.5 h-2.5" /> Recomeçar Tabuleiro
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tailwind classes helper for rotateY */}
      <style>{`
        .perspective-500 { perspective: 500px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .transform-rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
}
