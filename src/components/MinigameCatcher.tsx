/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gamepad2, Play, RefreshCw, X, Heart, Star, Sparkles } from 'lucide-react';
import { PetState } from '../types';

interface MinigameCatcherProps {
  petState: PetState;
  onFinishGame: (coinsEarned: number, funBoost: number, xpEarned: number) => void;
  onClose: () => void;
}

interface FallingItem {
  id: number;
  type: 'star' | 'asteroid';
  x: number; // percentage (0 to 100)
  y: number; // pixels from top (0 to gameHeight)
  speed: number;
  rotation: number;
}

export default function MinigameCatcher({
  petState,
  onFinishGame,
  onClose,
}: MinigameCatcherProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [lives, setLives] = useState(3);
  const [playerPosition, setPlayerPosition] = useState(50); // percentage (0 to 100)
  const [items, setItems] = useState<FallingItem[]>([]);
  const [screenShake, setScreenShake] = useState(false);

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | null>(null);
  const itemSpawnerRef = useRef<NodeJS.Timeout | null>(null);

  // Player skin color representation
  const getSkinColor = () => {
    switch (petState.currentSkin) {
      case 'skin_galaxy': return '#8b5cf6';
      case 'skin_neon': return '#10b981';
      case 'skin_void': return '#312e81';
      default: return '#3b82f6';
    }
  };

  // Handle Keyboard movement
  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setPlayerPosition((pos) => Math.max(5, pos - 8));
      } else if (e.key === 'ArrowRight') {
        setPlayerPosition((pos) => Math.min(95, pos + 8));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, gameOver]);

  // Game Loop
  useEffect(() => {
    if (!isPlaying || gameOver) {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      return;
    }

    const gameHeight = 280; // approximate height in pixels

    const updatePhysics = () => {
      setItems((prevItems) => {
        const updated: FallingItem[] = [];
        
        for (const item of prevItems) {
          const nextY = item.y + item.speed;

          // Check collision if item is near bottom (where the player is)
          if (nextY >= gameHeight - 35 && nextY <= gameHeight + 10) {
            const distance = Math.abs(item.x - playerPosition);
            if (distance < 12) {
              // Collision detected!
              if (item.type === 'star') {
                setScore((s) => s + 1);
                setCoins((c) => c + 1);
              } else {
                setLives((l) => {
                  const nextL = l - 1;
                  if (nextL <= 0) {
                    setGameOver(true);
                  }
                  return nextL;
                });
                // Trigger visual feedback screen shake
                setScreenShake(true);
                setTimeout(() => setScreenShake(false), 300);
              }
              // Skip adding to updated list (absorb/destroy item)
              continue;
            }
          }

          // Keep item if it hasn't reached the bottom
          if (nextY < gameHeight + 40) {
            updated.push({
              ...item,
              y: nextY,
              rotation: item.rotation + 2,
            });
          }
        }
        return updated;
      });

      requestRef.current = requestAnimationFrame(updatePhysics);
    };

    requestRef.current = requestAnimationFrame(updatePhysics);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, gameOver, playerPosition]);

  // Item Spawner
  useEffect(() => {
    if (!isPlaying || gameOver) {
      if (itemSpawnerRef.current) clearInterval(itemSpawnerRef.current);
      return;
    }

    itemSpawnerRef.current = setInterval(() => {
      const isStar = Math.random() > 0.35; // 65% chance for a star, 35% for an asteroid
      const newItem: FallingItem = {
        id: Date.now() + Math.random(),
        type: isStar ? 'star' : 'asteroid',
        x: 8 + Math.random() * 84, // keep away from edges
        y: -20,
        speed: 2 + Math.random() * 3 + (score * 0.08), // speed up as score increases
        rotation: Math.random() * 360,
      };

      setItems((prev) => [...prev, newItem]);
    }, 1000 - Math.min(score * 15, 600)); // spawn faster as score grows

    return () => {
      if (itemSpawnerRef.current) clearInterval(itemSpawnerRef.current);
    };
  }, [isPlaying, gameOver, score]);

  const handleStartGame = () => {
    setScore(0);
    setCoins(0);
    setLives(3);
    setPlayerPosition(50);
    setItems([]);
    setGameOver(false);
    setIsPlaying(true);
  };

  const handleGameOver = () => {
    // Fulfill loop: Boost Fun stat based on score, give XP and Coins
    const funBoost = Math.min(20 + score * 2, 50);
    const xpEarned = 10 + score * 3;
    onFinishGame(coins, funBoost, xpEarned);
    setIsPlaying(false);
    setGameOver(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between h-full relative overflow-hidden">
      {/* Tiny top stars decoration */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-48 h-0.5 bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />

      {/* Screen Shake Effect wrapper */}
      <div className={`flex flex-col h-full transition-transform duration-75 ${screenShake ? 'translate-y-1 animate-bounce' : ''}`}>
        
        {/* Minigame Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-violet-400" />
            <span className="font-display font-bold text-sm text-slate-100">Mini-jogo: Papa-Estrelas</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-slate-400 hover:text-white"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Game Main Area Frame */}
        <div 
          ref={gameAreaRef}
          className="relative w-full h-[280px] rounded-2xl bg-[#060613] border border-slate-800 overflow-hidden flex flex-col justify-between"
        >
          {/* Neon Grid Backing */}
          <div className="absolute inset-0 bg-linear-to-b from-transparent to-violet-950/10 pointer-events-none opacity-40" />
          
          {!isPlaying && !gameOver ? (
            // LOBBY START SCREEN
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-[#070714]/90">
              <div className="w-14 h-14 rounded-full bg-violet-600/10 border border-violet-500/30 flex items-center justify-center text-3xl mb-3 animate-pulse">
                ⭐
              </div>
              <h3 className="font-display font-bold text-base text-white">Papa-Estrelas Cósmico</h3>
              <p className="text-xs text-slate-400 max-w-xs mt-1.5 leading-relaxed">
                Ajude <b>{petState.name}</b> a coletar estrelas cadentes! Desvie de asteroides perigosos.
              </p>
              
              <div className="mt-4 flex flex-col gap-1.5 text-[10px] text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                <span className="flex items-center gap-1.5">⭐ Estrela: +1 Moeda e +1 Ponto</span>
                <span className="flex items-center gap-1.5">☄️ Asteroide: Perde 1 vida</span>
                <span className="font-mono text-[9px] text-violet-400 uppercase tracking-widest mt-1">Use as setas ou botões na tela</span>
              </div>

              <button
                onClick={handleStartGame}
                className="mt-5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-display font-bold text-xs tracking-wider px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-lg hover:scale-105 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" /> JOGAR AGORA
              </button>
            </div>
          ) : gameOver ? (
            // GAME OVER SUMMARY SCREEN
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-[#070714]/95">
              <div className="text-3xl mb-2 animate-bounce">👾</div>
              <h3 className="font-display font-bold text-lg text-rose-500 uppercase tracking-wide">Fim de Jogo!</h3>
              <p className="text-xs text-slate-400 mt-1">Ótimo esforço no espaço sideral!</p>
              
              {/* Stat Gains Display */}
              <div className="grid grid-cols-3 gap-3 my-4 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 w-full max-w-xs">
                <div className="flex flex-col items-center">
                  <span className="text-lg">🪙</span>
                  <span className="font-mono text-xs font-bold text-amber-400">+{coins}</span>
                  <span className="text-[9px] text-slate-400 font-sans">Moedas</span>
                </div>
                <div className="flex flex-col items-center border-x border-slate-800">
                  <span className="text-lg">✨</span>
                  <span className="font-mono text-xs font-bold text-purple-400">+{10 + score * 3}</span>
                  <span className="text-[9px] text-slate-400 font-sans">XP</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-lg">🎡</span>
                  <span className="font-mono text-xs font-bold text-pink-400">+{Math.min(20 + score * 2, 50)}%</span>
                  <span className="text-[9px] text-slate-400 font-sans">Diversão</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleStartGame}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-display font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Repetir
                </button>
                <button
                  onClick={handleGameOver}
                  className="bg-violet-600 hover:bg-violet-500 text-white font-display font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all"
                >
                  Pegar Recompensas
                </button>
              </div>
            </div>
          ) : (
            // ACTIVE PLAY SCREEN
            <>
              {/* HUD / Indicators Overlay */}
              <div className="absolute inset-x-0 top-0 p-3 flex justify-between items-center z-10 bg-gradient-to-b from-black/60 to-transparent">
                {/* Score */}
                <div className="flex items-center gap-1.5 bg-slate-900/60 border border-slate-800/40 px-2.5 py-1 rounded-xl">
                  <span className="text-amber-400 text-xs">⭐</span>
                  <span className="font-mono text-xs font-bold text-white">{score} pt</span>
                </div>

                {/* Live Coins */}
                <div className="flex items-center gap-1.5 bg-slate-900/60 border border-slate-800/40 px-2.5 py-1 rounded-xl">
                  <span className="text-xs">🪙</span>
                  <span className="font-mono text-xs font-bold text-amber-400">+{coins}</span>
                </div>

                {/* Lives Hearts */}
                <div className="flex gap-1">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Heart
                      key={i}
                      className={`w-4 h-4 ${
                        i < lives 
                          ? 'text-red-500 fill-red-500 filter drop-shadow-[0_0_4px_rgba(239,68,68,0.4)]' 
                          : 'text-slate-800 fill-slate-800'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Falling items Layer */}
              <div className="absolute inset-0 pointer-events-none">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="absolute text-xl"
                    style={{
                      left: `${item.x}%`,
                      top: `${item.y}px`,
                      transform: `rotate(${item.rotation}deg)`,
                      transition: 'top 0.05s linear',
                    }}
                  >
                    {item.type === 'star' ? (
                      <span className="filter drop-shadow-[0_0_8px_rgba(251,191,36,0.6)] select-none">⭐</span>
                    ) : (
                      <span className="filter drop-shadow-[0_0_6px_rgba(244,63,94,0.4)] select-none">☄️</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Player Avatar */}
              <div
                className="absolute bottom-2 h-10 w-10 flex items-center justify-center transition-all duration-75"
                style={{
                  left: `${playerPosition}%`,
                  transform: 'translateX(-50%)',
                }}
              >
                {/* Simplified dynamic pet face matching skin color */}
                <div 
                  className="w-8 h-8 rounded-full border border-white/20 flex flex-col justify-center items-center relative shadow-md"
                  style={{ backgroundColor: getSkinColor() }}
                >
                  <div className="absolute -top-1 w-2 h-2 rounded-full bg-yellow-400" />
                  <div className="flex gap-1.5 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                  <div className="w-3 h-1.5 border-b border-white rounded-b-sm mt-0.5" />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Mobile controls & guidance */}
        {isPlaying && !gameOver && (
          <div className="mt-4 flex gap-4 w-full">
            <button
              onTouchStart={() => setPlayerPosition((pos) => Math.max(5, pos - 12))}
              onClick={() => setPlayerPosition((pos) => Math.max(5, pos - 12))}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-2xl font-display font-bold text-xs text-slate-200 active:scale-95 transition-all shadow-md select-none border border-slate-700/50"
            >
              ◀ Mover Esquerda
            </button>
            <button
              onTouchStart={() => setPlayerPosition((pos) => Math.min(95, pos + 12))}
              onClick={() => setPlayerPosition((pos) => Math.min(95, pos + 12))}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-2xl font-display font-bold text-xs text-slate-200 active:scale-95 transition-all shadow-md select-none border border-slate-700/50"
            >
              Mover Direita ▶
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
