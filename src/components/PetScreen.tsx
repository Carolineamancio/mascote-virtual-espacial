/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart, RefreshCw, Moon, AlertTriangle, CloudRain, Shield } from 'lucide-react';
import { PetState, FOOD_ITEMS, COSMIC_ACCESSORIES } from '../types';

interface PetScreenProps {
  petState: PetState;
  activeAction: 'none' | 'feeding' | 'bathing' | 'playing' | 'petted';
  onPetClick: () => void;
  activeFoodId?: string;
}

interface Particle {
  id: number;
  type: 'heart' | 'bubble' | 'star' | 'crumb' | 'zzz' | 'stink';
  x: number;
  y: number;
  scale: number;
  text?: string;
}

export default function PetScreen({
  petState,
  activeAction,
  onPetClick,
  activeFoodId,
}: PetScreenProps) {
  const {
    name,
    level,
    xp,
    xpToNextLevel,
    hunger,
    hygiene,
    fun,
    energy,
    isSleeping,
    currentSkin,
    currentAccessory,
  } = petState;

  const [isBlinking, setIsBlinking] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showHeartPulse, setShowHeartPulse] = useState(false);

  // Blink cycle
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      if (!isSleeping) {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 150);
      }
    }, 4000);
    return () => clearInterval(blinkInterval);
  }, [isSleeping]);

  // Particle generator on actions
  useEffect(() => {
    if (activeAction === 'feeding') {
      const food = FOOD_ITEMS.find((f) => f.id === activeFoodId);
      const foodEmoji = food ? food.icon : '🍬';
      // Spawn crumbs/sparkles
      const newParticles = Array.from({ length: 6 }).map((_, i) => ({
        id: Date.now() + i,
        type: 'crumb' as const,
        x: 40 + Math.random() * 20, // relative % in container
        y: 50 + Math.random() * 10,
        scale: 0.5 + Math.random() * 0.5,
        text: foodEmoji,
      }));
      setParticles((prev) => [...prev, ...newParticles]);
    } else if (activeAction === 'bathing') {
      // Spawn bubbles
      const newParticles = Array.from({ length: 8 }).map((_, i) => ({
        id: Date.now() + i,
        type: 'bubble' as const,
        x: 30 + Math.random() * 40,
        y: 20 + Math.random() * 30,
        scale: 0.6 + Math.random() * 0.8,
      }));
      setParticles((prev) => [...prev, ...newParticles]);
    } else if (activeAction === 'playing') {
      // Spawn stars
      const newParticles = Array.from({ length: 6 }).map((_, i) => ({
        id: Date.now() + i,
        type: 'star' as const,
        x: 30 + Math.random() * 40,
        y: 30 + Math.random() * 35,
        scale: 0.8 + Math.random() * 0.5,
      }));
      setParticles((prev) => [...prev, ...newParticles]);
    } else if (activeAction === 'petted') {
      // Spawn hearts
      setShowHeartPulse(true);
      const newParticles = Array.from({ length: 5 }).map((_, i) => ({
        id: Date.now() + i,
        type: 'heart' as const,
        x: 35 + Math.random() * 30,
        y: 45 + Math.random() * 15,
        scale: 0.8 + Math.random() * 0.6,
      }));
      setParticles((prev) => [...prev, ...newParticles]);
      const timer = setTimeout(() => setShowHeartPulse(false), 800);
      return () => clearTimeout(timer);
    }
  }, [activeAction, activeFoodId]);

  // Sleep Zzz generator
  useEffect(() => {
    if (isSleeping) {
      const zzzInterval = setInterval(() => {
        const newZ = {
          id: Date.now(),
          type: 'zzz' as const,
          x: 55 + Math.random() * 10,
          y: 40 + Math.random() * 10,
          scale: 0.6 + Math.random() * 0.6,
          text: 'Zzz',
        };
        setParticles((prev) => [...prev, newZ].slice(-20)); // Limit active particles
      }, 1500);
      return () => clearInterval(zzzInterval);
    }
  }, [isSleeping]);

  // Periodic dirty stink particles if hygiene is low
  useEffect(() => {
    if (hygiene < 35 && !isSleeping) {
      const stinkInterval = setInterval(() => {
        const newStink = {
          id: Date.now(),
          type: 'stink' as const,
          x: 30 + Math.random() * 40,
          y: 40 + Math.random() * 20,
          scale: 0.5 + Math.random() * 0.5,
        };
        setParticles((prev) => [...prev, newStink].slice(-20));
      }, 2500);
      return () => clearInterval(stinkInterval);
    }
  }, [hygiene, isSleeping]);

  // Clean old particles
  useEffect(() => {
    if (particles.length > 0) {
      const cleanup = setTimeout(() => {
        setParticles((prev) => prev.filter((p) => Date.now() - p.id < 2000));
      }, 2000);
      return () => clearTimeout(cleanup);
    }
  }, [particles]);

  // Determine Pet Colors & Skins
  const getSkinColors = () => {
    switch (currentSkin) {
      case 'skin_galaxy':
        return {
          primary: '#8b5cf6', // purple-500
          secondary: '#ec4899', // pink-500
          glow: 'rgba(139, 92, 246, 0.6)',
          ambientGlow: 'from-purple-900/40 via-fuchsia-950/20 to-transparent',
        };
      case 'skin_neon':
        return {
          primary: '#10b981', // emerald-500
          secondary: '#06b6d4', // cyan-500
          glow: 'rgba(16, 185, 129, 0.6)',
          ambientGlow: 'from-emerald-950/40 via-cyan-950/20 to-transparent',
        };
      case 'skin_void':
        return {
          primary: '#312e81', // dark indigo-900
          secondary: '#111827', // dark gray-900
          glow: 'rgba(79, 70, 229, 0.4)',
          ambientGlow: 'from-indigo-950/50 via-slate-950/30 to-transparent',
        };
      case 'skin_classic':
      default:
        return {
          primary: '#3b82f6', // blue-500
          secondary: '#60a5fa', // blue-400
          glow: 'rgba(59, 130, 246, 0.5)',
          ambientGlow: 'from-blue-950/40 via-indigo-950/20 to-transparent',
        };
    }
  };

  const skin = getSkinColors();

  // Get Pet Emotion Text/State for floating bubble
  const getPetEmotionState = () => {
    if (isSleeping) return { emoji: '💤', text: 'Dormindo...' };
    if (activeAction === 'feeding') return { emoji: '😋', text: 'Nham Nham!' };
    if (activeAction === 'bathing') return { emoji: '🧼', text: 'Splish Splash!' };
    if (activeAction === 'playing') return { emoji: '🚀', text: 'Aeee!' };
    if (activeAction === 'petted') return { emoji: '🥰', text: 'Ronrom...' };
    
    // Check threshold states
    if (hunger < 25) return { emoji: '🍕', text: 'Fome!' };
    if (hygiene < 25) return { emoji: '🤢', text: 'Sujeira!' };
    if (fun < 25) return { emoji: '🥺', text: 'Tédio...' };
    if (energy < 20) return { emoji: '😴', text: 'Cansado' };

    if (hunger > 80 && hygiene > 80 && fun > 80) return { emoji: '✨', text: 'Radiante!' };
    return { emoji: '👾', text: 'Feliz' };
  };

  const emotion = getPetEmotionState();

  // Check if any critical needs are warning levels (<25)
  const isCritical = hunger < 25 || hygiene < 25 || fun < 25 || energy < 20;

  return (
    <div 
      id="pet_screen_container"
      className="relative w-full h-[360px] rounded-3xl overflow-hidden bg-black/40 border border-white/10 shadow-2xl flex flex-col justify-between p-4 select-none backdrop-blur-xl"
    >
      {/* Background Starry Atmosphere */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -inset-[50%] bg-gradient-to-tr ${skin.ambientGlow} rounded-full cosmic-nebula transition-all duration-1000`} />
        {/* Sparkly grid stars */}
        <div className="absolute top-[12%] left-[15%] w-1.5 h-1.5 bg-white rounded-full opacity-60 animate-pulse" />
        <div className="absolute top-[25%] right-[20%] w-1 h-1 bg-violet-400 rounded-full opacity-40 animate-pulse" />
        <div className="absolute bottom-[30%] left-[25%] w-2 h-2 bg-pink-400 rounded-full opacity-30 animate-ping" style={{ animationDuration: '3s' }} />
        <div className="absolute bottom-[15%] right-[12%] w-1.5 h-1.5 bg-cyan-300 rounded-full opacity-50 animate-pulse" />
        
        {/* Cosmic Constellation Lines or faint planets */}
        <div className="absolute top-8 right-8 w-12 h-12 rounded-full border border-dashed border-white/5 opacity-40 flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-indigo-500/10 border border-indigo-500/30" />
        </div>
      </div>

      {/* Floating particles layer */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        <AnimatePresence>
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ y: p.y * 3.6, x: p.x * 4.2 - 20, opacity: 1, scale: 0 }}
              animate={{ 
                y: p.y * 3.6 - 120, 
                x: p.x * 4.2 - 20 + (Math.sin(p.id) * 40), 
                opacity: 0,
                scale: p.scale * 1.5,
                rotate: Math.sin(p.id) * 30
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.6, ease: 'easeOut' }}
              className="absolute text-xl select-none filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
            >
              {p.type === 'heart' && <Heart className="text-red-500 fill-red-500 w-6 h-6" />}
              {p.type === 'bubble' && (
                <div className="w-5 h-5 rounded-full border border-sky-300/60 bg-sky-400/20 shadow-inner flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/70 absolute top-0.5 left-0.5" />
                </div>
              )}
              {p.type === 'star' && <Sparkles className="text-amber-300 fill-amber-300 w-6 h-6 animate-spin" />}
              {p.type === 'crumb' && <span className="text-2xl">{p.text}</span>}
              {p.type === 'zzz' && <span className="font-display font-semibold text-purple-300 tracking-widest">{p.text}</span>}
              {p.type === 'stink' && <span className="text-emerald-400 opacity-60 font-bold">~</span>}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Header Info - Level & Emotion Bubble */}
      <div className="flex justify-between items-center z-10">
        {/* Name & LVL badges */}
        <div id="pet_lvl_badge" className="flex flex-col bg-black/40 border border-white/10 backdrop-blur-xl rounded-2xl px-3.5 py-2 shadow-2xl">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-sm text-slate-100">{name}</span>
            <span className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white font-mono text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">
              LV {level}
            </span>
          </div>
          {/* XP progress mini bar */}
          <div className="mt-1.5 w-24">
            <div className="flex justify-between text-[8px] text-slate-400 font-mono mb-0.5">
              <span>XP</span>
              <span>{xp}/{xpToNextLevel}</span>
            </div>
            <div className="h-1.5 w-full bg-slate-950/60 rounded-full overflow-hidden border border-white/5">
              <motion.div 
                className="h-full bg-gradient-to-r from-blue-400 to-purple-400"
                initial={{ width: 0 }}
                animate={{ width: `${(xp / xpToNextLevel) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>

        {/* Emotion status badge */}
        <div className="flex items-center gap-1.5">
          <AnimatePresence mode="wait">
            <motion.div
              key={emotion.text}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className={`flex items-center gap-1.5 bg-black/60 backdrop-blur-xl border border-white/10 px-3.5 py-1.5 rounded-full shadow-2xl ${
                isCritical && !isSleeping ? 'border-amber-500/40 text-amber-300' : 'text-slate-200'
              }`}
            >
              <span className="text-base">{emotion.emoji}</span>
              <span className="font-display text-[10px] font-bold tracking-wider uppercase text-slate-100">{emotion.text}</span>
            </motion.div>
          </AnimatePresence>

          {/* Critical needs warning button/alert */}
          {isCritical && !isSleeping && (
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="bg-amber-500/20 border border-amber-500/40 text-amber-400 p-1.5 rounded-full shadow-md cursor-help"
              title="Atenção! Seu mascote tem necessidades críticas."
            >
              <AlertTriangle className="w-4 h-4" />
            </motion.div>
          )}
        </div>
      </div>

      {/* Main Interactive Pet SVG Rendering */}
      <div className="relative flex-1 flex items-center justify-center py-6 overflow-hidden">
        {/* Glowing Platform and Light Rings */}
        <div className="absolute w-[360px] h-[360px] border border-blue-500/15 rounded-full animate-pulse pointer-events-none" />
        <div className="absolute w-[260px] h-[260px] border-2 border-indigo-500/5 rounded-full pointer-events-none" />
        <div className="absolute w-[440px] h-[440px] border border-dashed border-purple-500/5 rounded-full animate-spin pointer-events-none" style={{ animationDuration: '60s' }} />
        <div className="absolute w-[400px] h-[80px] bg-gradient-to-t from-blue-500/10 to-transparent rounded-[100%] bottom-2 blur-xl pointer-events-none" />

        {/* Background glow surrounding the pet */}
        <div 
          className="absolute w-44 h-44 rounded-full filter blur-[40px] opacity-25 mix-blend-screen pointer-events-none transition-all duration-700" 
          style={{ backgroundColor: skin.primary }}
        />

        {/* Pet container with float and bounce animation when petted */}
        <motion.div
          id="mascote_avatar_container"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onPetClick}
          className={`relative z-10 cursor-pointer flex flex-col items-center justify-center select-none ${
            isSleeping ? 'opacity-90' : 'animate-float-pet'
          }`}
          animate={
            activeAction === 'playing'
              ? { y: [0, -35, 0], scaleY: [1, 0.8, 1.2, 1] }
              : activeAction === 'feeding'
              ? { scale: [1, 1.08, 0.96, 1.04, 1] }
              : showHeartPulse
              ? { scale: [1, 1.1, 0.95, 1.05, 1] }
              : {}
          }
          transition={{
            duration: activeAction === 'playing' ? 0.6 : 0.8,
            ease: 'easeInOut',
            repeat: activeAction === 'playing' ? 3 : 0,
          }}
        >
          {/* Main Pet SVG */}
          <svg
            width="180"
            height="180"
            viewBox="0 0 120 120"
            className="drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)]"
          >
            <defs>
              {/* Dynamic Body Radial Gradient */}
              <radialGradient id="petBodyGradient" cx="40%" cy="40%" r="60%">
                <stop offset="0%" stopColor={skin.secondary} />
                <stop offset="70%" stopColor={skin.primary} />
                <stop offset="100%" stopColor={skin.primary === '#312e81' ? '#030712' : '#1e1b4b'} />
              </radialGradient>
              
              <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Antennas / Magic Horn */}
            <g id="pet-antennas">
              {/* Back Horn or Main magical Antenna */}
              <path
                d="M 60,35 Q 60,12 60,10"
                stroke={skin.secondary}
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
              {/* Antenna Bulb (glowing orb) */}
              <motion.circle
                cx="60"
                cy="10"
                r="6"
                fill={
                  isSleeping
                    ? '#6366f1' // dark indigo
                    : isCritical
                    ? '#f59e0b' // pulsing amber
                    : '#fbbf24' // sparkling gold
                }
                animate={
                  isCritical
                    ? { r: [6, 8, 6], opacity: [0.7, 1, 0.7] }
                    : { r: [5, 6.5, 5] }
                }
                transition={{ repeat: Infinity, duration: 1.5 }}
                filter="url(#neonGlow)"
              />
              
              {/* Tiny auxiliary floating side ears or wings */}
              <motion.path
                d="M 35,45 Q 12,30 20,55"
                fill={skin.primary}
                stroke={skin.secondary}
                strokeWidth="2"
                animate={{ rotate: isSleeping ? 0 : [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
              />
              <motion.path
                d="M 85,45 Q 108,30 100,55"
                fill={skin.primary}
                stroke={skin.secondary}
                strokeWidth="2"
                animate={{ rotate: isSleeping ? 0 : [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut', delay: 0.3 }}
              />
            </g>

            {/* Main Body Orb */}
            <circle
              cx="60"
              cy="65"
              r="34"
              fill="url(#petBodyGradient)"
              stroke={skin.secondary}
              strokeWidth="2.5"
            />

            {/* Glowing tummy patch (magic spiral or star) */}
            <circle
              cx="60"
              cy="76"
              r="14"
              fill="rgba(255, 255, 255, 0.12)"
              stroke="rgba(255, 255, 255, 0.25)"
              strokeWidth="1.5"
              strokeDasharray="2,2"
            />
            {/* Glowing center star on tummy */}
            <path
              d="M 60,70 L 62,74 L 66,74 L 63,77 L 64,81 L 60,79 L 56,81 L 57,77 L 54,74 L 58,74 Z"
              fill={skin.secondary}
              opacity="0.8"
            />

            {/* Expressive Face Layer */}
            <g id="pet-face">
              {/* Blush cheeks */}
              {(fun > 55 || activeAction === 'petted' || activeAction === 'feeding') && (
                <>
                  <ellipse cx="40" cy="68" rx="5" ry="3" fill="#f43f5e" opacity="0.45" />
                  <ellipse cx="80" cy="68" rx="5" ry="3" fill="#f43f5e" opacity="0.45" />
                </>
              )}

              {/* Eyes */}
              {isSleeping ? (
                // Sleeping closed curved eyes (Zzz)
                <>
                  <path d="M 35,62 Q 43,68 47,62" fill="none" stroke="#f1f5f9" strokeWidth="3" strokeLinecap="round" />
                  <path d="M 73,62 Q 77,68 85,62" fill="none" stroke="#f1f5f9" strokeWidth="3" strokeLinecap="round" />
                </>
              ) : isBlinking ? (
                // Closed eyes (blinking)
                <>
                  <line x1="34" y1="62" x2="48" y2="62" stroke="#f1f5f9" strokeWidth="3" strokeLinecap="round" />
                  <line x1="72" y1="62" x2="86" y2="62" stroke="#f1f5f9" strokeWidth="3" strokeLinecap="round" />
                </>
              ) : activeAction === 'feeding' || activeAction === 'petted' || activeAction === 'playing' ? (
                // Happy curved upwards eyes ( ^ ^ )
                <>
                  <path d="M 34,64 Q 41,54 48,64" fill="none" stroke="#f1f5f9" strokeWidth="3.5" strokeLinecap="round" />
                  <path d="M 72,64 Q 79,54 86,64" fill="none" stroke="#f1f5f9" strokeWidth="3.5" strokeLinecap="round" />
                </>
              ) : hunger < 30 || fun < 30 ? (
                // Sad or worried eyes
                <>
                  {/* Sad eyebrows */}
                  <path d="M 32,54 Q 42,56 46,59" fill="none" stroke="#f1f5f9" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M 88,54 Q 78,56 74,59" fill="none" stroke="#f1f5f9" strokeWidth="1.5" strokeLinecap="round" />
                  {/* Eyes */}
                  <circle cx="40" cy="63" r="5" fill="#f1f5f9" />
                  <circle cx="80" cy="63" r="5" fill="#f1f5f9" />
                  {/* pupils shine */}
                  <circle cx="39" cy="61" r="1.5" fill="#0f172a" />
                  <circle cx="79" cy="61" r="1.5" fill="#0f172a" />
                </>
              ) : (
                // Classic wide-open cosmic eyes
                <>
                  {/* Left Eye */}
                  <circle cx="40" cy="61" r="6.5" fill="#f1f5f9" />
                  <circle cx="40" cy="61" r="4.5" fill="#0f172a" />
                  <circle cx="38" cy="59" r="2" fill="#ffffff" />
                  <circle cx="42" cy="63" r="1" fill="#ffffff" />

                  {/* Right Eye */}
                  <circle cx="80" cy="61" r="6.5" fill="#f1f5f9" />
                  <circle cx="80" cy="61" r="4.5" fill="#0f172a" />
                  <circle cx="78" cy="59" r="2" fill="#ffffff" />
                  <circle cx="82" cy="63" r="1" fill="#ffffff" />
                </>
              )}

              {/* Mouth */}
              {isSleeping ? (
                // Tiny O-mouth for sleeping / breathing
                <circle cx="60" cy="72" r="2" fill="#f1f5f9" />
              ) : activeAction === 'feeding' ? (
                // Chewing big open happy mouth
                <ellipse cx="60" cy="74" rx="6" ry="4" fill="#ef4444" stroke="#f1f5f9" strokeWidth="1.5" />
              ) : activeAction === 'petted' || activeAction === 'playing' || fun > 70 ? (
                // Huge smiling mouth
                <path d="M 53,70 Q 60,78 67,70" fill="none" stroke="#f1f5f9" strokeWidth="3" strokeLinecap="round" />
              ) : hunger < 35 || fun < 35 ? (
                // Sad mouth curve
                <path d="M 54,75 Q 60,71 66,75" fill="none" stroke="#f1f5f9" strokeWidth="2.5" strokeLinecap="round" />
              ) : (
                // Normal happy cat-style small mouth
                <path d="M 54,71 Q 57,74 60,71 Q 63,74 66,71" fill="none" stroke="#f1f5f9" strokeWidth="2" strokeLinecap="round" />
              )}
            </g>

            {/* Custom Accessories Overlay */}
            <g id="pet-accessories">
              {currentAccessory === 'acc_glasses' && (
                // Cool cycle double glasses or cosmic specs
                <g stroke="#ff007f" strokeWidth="3" fill="none" filter="url(#neonGlow)">
                  <circle cx="40" cy="61" r="9" />
                  <circle cx="80" cy="61" r="9" />
                  <line x1="49" y1="61" x2="71" y2="61" />
                  <line x1="22" y1="61" x2="31" y2="61" />
                  <line x1="89" y1="61" x2="98" y2="61" />
                </g>
              )}

              {currentAccessory === 'acc_crown' && (
                // Shiny gold floating crown
                <motion.g
                  animate={{ y: [0, -3, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                >
                  <path
                    d="M 45,26 L 41,12 L 51,18 L 60,8 L 69,18 L 79,12 L 75,26 Z"
                    fill="#f59e0b"
                    stroke="#fbbf24"
                    strokeWidth="1.5"
                  />
                  {/* Crown gems */}
                  <circle cx="60" cy="8" r="2" fill="#ef4444" />
                  <circle cx="41" cy="12" r="1.5" fill="#3b82f6" />
                  <circle cx="79" cy="12" r="1.5" fill="#10b981" />
                  <ellipse cx="60" cy="21" rx="2" ry="1.5" fill="#3b82f6" />
                </motion.g>
              )}

              {currentAccessory === 'acc_helmet' && (
                // Glass bubble bubble helmet
                <circle
                  cx="60"
                  cy="60"
                  r="44"
                  fill="rgba(14, 165, 233, 0.08)"
                  stroke="rgba(255, 255, 255, 0.4)"
                  strokeWidth="2"
                  strokeDasharray="40 10 5 10"
                />
              )}

              {currentAccessory === 'acc_headphones' && (
                // Sleek futuristic headphones
                <g stroke="#06b6d4" strokeWidth="3.5" fill="none" filter="url(#neonGlow)">
                  {/* Left ear piece */}
                  <path d="M 23,55 C 20,55 18,65 23,75" strokeLinecap="round" />
                  {/* Right ear piece */}
                  <path d="M 97,55 C 100,55 102,65 97,75" strokeLinecap="round" />
                  {/* Headband connecting across */}
                  <path d="M 24,55 A 38,38 0 0,1 96,55" />
                  {/* Glowing detail */}
                  <circle cx="21" cy="65" r="2" fill="#22d3ee" stroke="none" />
                  <circle cx="99" cy="65" r="2" fill="#22d3ee" stroke="none" />
                </g>
              )}

              {currentAccessory === 'acc_bow' && (
                // Floating magic bow
                <g transform="translate(74, 34)" fill="#f43f5e" stroke="#fda4af" strokeWidth="1">
                  <path d="M 0,0 C -6,-12 -16,-2 -4,4 Z" />
                  <path d="M 0,0 C 6,-12 16,-2 4,4 Z" />
                  <circle cx="0" cy="0" r="3.5" fill="#ffe4e6" />
                  {/* Ribbons hanging down */}
                  <path d="M -2,2 L -8,12 L -3,10 Z" />
                  <path d="M 2,2 L 8,12 L 3,10 Z" />
                </g>
              )}
            </g>
          </svg>

          {/* Glowing Shadow on floor */}
          <div 
            className="w-24 h-4 bg-black/40 rounded-full blur-xs mt-3 transition-all duration-1000"
            style={{
              transform: isSleeping 
                ? 'scale(0.9)' 
                : activeAction === 'playing'
                ? 'scale(0.6)'
                : 'scale(1)',
              opacity: isSleeping ? 0.6 : 0.8
            }}
          />
        </motion.div>
      </div>

      {/* Bathing Bubble Shower Spray Overlay */}
      {activeAction === 'bathing' && (
        <div className="absolute inset-x-0 top-12 bottom-4 pointer-events-none flex flex-col items-center justify-start z-10 overflow-hidden">
          <motion.div 
            className="flex gap-4 justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {Array.from({ length: 6 }).map((_, idx) => (
              <motion.div
                key={idx}
                animate={{ y: [0, 240], opacity: [0, 1, 1, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 0.8 + idx * 0.15,
                  ease: 'linear',
                  delay: idx * 0.1,
                }}
                className="text-sky-300 text-lg opacity-80"
              >
                💧
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      {/* Footer hint/pet name plate */}
      <div className="flex justify-center z-10">
        <span className="font-mono text-[10px] text-slate-500 bg-slate-950/40 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-slate-900">
          Toque em {name} para fazer carinho • Toque duplo para brincar
        </span>
      </div>
    </div>
  );
}
