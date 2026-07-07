/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Heart, 
  Trash2, 
  Award, 
  Calendar, 
  User, 
  Info, 
  Gamepad2, 
  ShoppingBag, 
  TrendingUp, 
  ArrowLeftCircle,
  HelpCircle
} from 'lucide-react';

import { PetState, FOOD_ITEMS, COSMIC_ACCESSORIES, FoodItem, CosmicAccessory } from './types';
import PetScreen from './components/PetScreen';
import StatsBar from './components/StatsBar';
import ActionControls from './components/ActionControls';
import ShopModal from './components/ShopModal';
import MinigameCatcher from './components/MinigameCatcher';
import MinigameMemory from './components/MinigameMemory';

// Default initial state for a new pet
const createNewPet = (name: string, skinId = 'skin_classic'): PetState => ({
  name: name.trim() || 'Cosmo',
  level: 1,
  xp: 0,
  xpToNextLevel: 100,
  hunger: 80,
  hygiene: 70,
  fun: 60,
  energy: 50,
  coins: 40, // Generous starter coins
  isSleeping: false,
  currentSkin: skinId,
  currentAccessory: 'acc_none',
  unlockedSkins: [skinId],
  unlockedAccessories: ['acc_none'],
  birthday: Date.now(),
  lastUpdate: Date.now(),
  timesFed: 0,
  timesCleaned: 0,
  minigamesPlayed: 0,
});

export default function App() {
  const [petState, setPetState] = useState<PetState | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Dialogs & Screens States
  const [onboardingName, setOnboardingName] = useState('');
  const [onboardingSkin, setOnboardingSkin] = useState('skin_classic');
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [activeGame, setActiveGame] = useState<'catcher' | 'memory' | null>(null);
  const [activeSubTray, setActiveSubTray] = useState<'none' | 'food' | 'play'>('none');
  const [activeAction, setActiveAction] = useState<'none' | 'feeding' | 'bathing' | 'playing' | 'petted'>('none');
  const [activeFoodId, setActiveFoodId] = useState<string | undefined>(undefined);
  
  // Level Up Trigger Overlay State
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpInfo, setLevelUpInfo] = useState({ oldLevel: 1, newLevel: 2, coinReward: 50 });

  // Load pet from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('astro_pet_save');
      if (saved) {
        const parsed = JSON.parse(saved) as PetState;
        
        // Calculate offline needs decay
        const timeElapsedMs = Date.now() - parsed.lastUpdate;
        const timeElapsedMins = Math.floor(timeElapsedMs / 60000);

        if (timeElapsedMins > 0) {
          // Decay rates:
          // Hunger: -1 every 3 minutes
          // Hygiene: -1 every 5 minutes
          // Fun: -1 every 4 minutes
          // Energy: If sleeping +1 every 2 minutes, if awake -1 every 6 minutes
          const hungerDecay = Math.floor(timeElapsedMins / 3);
          const hygieneDecay = Math.floor(timeElapsedMins / 5);
          const funDecay = Math.floor(timeElapsedMins / 4);
          
          let nextEnergy = parsed.energy;
          if (parsed.isSleeping) {
            nextEnergy = Math.min(100, parsed.energy + Math.floor(timeElapsedMins / 2));
          } else {
            nextEnergy = Math.max(0, parsed.energy - Math.floor(timeElapsedMins / 6));
          }

          parsed.hunger = Math.max(0, parsed.hunger - hungerDecay);
          parsed.hygiene = Math.max(0, parsed.hygiene - hygieneDecay);
          parsed.fun = Math.max(0, parsed.fun - funDecay);
          parsed.energy = nextEnergy;
          parsed.lastUpdate = Date.now();
        }

        setPetState(parsed);
      }
    } catch (e) {
      console.error('Falha ao carregar mascote salvo', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save pet state changes to local storage
  const saveState = (newState: PetState) => {
    localStorage.setItem('astro_pet_save', JSON.stringify(newState));
  };

  // Real-time Decay Loop
  useEffect(() => {
    if (!petState) return;

    const interval = setInterval(() => {
      setPetState((current) => {
        if (!current) return null;

        // If sleeping, restore energy. If awake, decay all stats slowly.
        let nextHunger = current.hunger;
        let nextHygiene = current.hygiene;
        let nextFun = current.fun;
        let nextEnergy = current.energy;

        if (current.isSleeping) {
          nextEnergy = Math.min(100, nextEnergy + 3); // Restores quickly
          // Stats decay slower during sleep
          if (Math.random() > 0.6) nextHunger = Math.max(0, nextHunger - 1);
          if (Math.random() > 0.8) nextHygiene = Math.max(0, nextHygiene - 1);
        } else {
          // Regular decay
          if (Math.random() > 0.4) nextHunger = Math.max(0, nextHunger - 1);
          if (Math.random() > 0.5) nextHygiene = Math.max(0, nextHygiene - 1);
          if (Math.random() > 0.5) nextFun = Math.max(0, nextFun - 1);
          if (Math.random() > 0.7) nextEnergy = Math.max(0, nextEnergy - 1);
        }

        const updated = {
          ...current,
          hunger: nextHunger,
          hygiene: nextHygiene,
          fun: nextFun,
          energy: nextEnergy,
          lastUpdate: Date.now(),
        };

        saveState(updated);
        return updated;
      });
    }, 8000); // Check and decay slightly every 8s for lively real-time feedback

    return () => clearInterval(interval);
  }, [petState]);

  // Sleep restoration continuous clock (ticks faster)
  useEffect(() => {
    if (!petState || !petState.isSleeping) return;

    const sleepInterval = setInterval(() => {
      setPetState((current) => {
        if (!current || !current.isSleeping) return current;
        if (current.energy >= 100) {
          // Fully rested, wake up!
          setActiveAction('none');
          const wokeState = { ...current, isSleeping: false, energy: 100 };
          saveState(wokeState);
          return wokeState;
        }

        const updated = {
          ...current,
          energy: Math.min(100, current.energy + 2),
          lastUpdate: Date.now(),
        };
        saveState(updated);
        return updated;
      });
    }, 1500);

    return () => clearInterval(sleepInterval);
  }, [petState]);

  // Handle XP Gains and Level Ups
  const grantXP = (state: PetState, amount: number): PetState => {
    let nextXp = state.xp + amount;
    let nextLevel = state.level;
    let nextXpToLevel = state.xpToNextLevel;
    let leveledUp = false;

    while (nextXp >= nextXpToLevel) {
      nextXp -= nextXpToLevel;
      nextLevel += 1;
      nextXpToLevel = nextLevel * 50 + 100;
      leveledUp = true;
    }

    let updated = {
      ...state,
      xp: nextXp,
      level: nextLevel,
      xpToNextLevel: nextXpToLevel,
    };

    if (leveledUp) {
      const bonusCoins = nextLevel * 25;
      updated.coins += bonusCoins;
      setLevelUpInfo({
        oldLevel: state.level,
        newLevel: nextLevel,
        coinReward: bonusCoins,
      });
      setShowLevelUp(true);
    }

    return updated;
  };

  // Adopt Action Handler
  const handleAdopt = () => {
    const freshName = onboardingName.trim() || 'Cosmo';
    const freshPet = createNewPet(freshName, onboardingSkin);
    setPetState(freshPet);
    saveState(freshPet);
  };

  // Feed Action Handler
  const handleFeed = (food: FoodItem) => {
    if (!petState || petState.isSleeping) return;

    // Check coins if premium
    if (petState.coins < food.cost && food.cost > 0) return;

    // Trigger eating action
    setActiveAction('feeding');
    setActiveFoodId(food.id);
    setActiveSubTray('none');

    setPetState((current) => {
      if (!current) return null;

      const updated = {
        ...current,
        hunger: Math.min(100, current.hunger + food.hungerGain),
        energy: Math.min(100, Math.max(0, current.energy + food.energyGain)),
        coins: current.coins - food.cost,
        timesFed: current.timesFed + 1,
      };

      const withXp = grantXP(updated, 15); // feeding gives 15 XP
      saveState(withXp);
      return withXp;
    });

    // Clear action after eating animation duration
    setTimeout(() => {
      setActiveAction('none');
      setActiveFoodId(undefined);
    }, 1600);
  };

  // Shower Action Handler
  const handleBath = () => {
    if (!petState || petState.isSleeping || activeAction === 'bathing') return;

    setActiveAction('bathing');
    setActiveSubTray('none');

    // Continuously increase hygiene over 4 seconds
    let secondsLeft = 4;
    const interval = setInterval(() => {
      setPetState((current) => {
        if (!current) return null;
        return {
          ...current,
          hygiene: Math.min(100, current.hygiene + 8),
        };
      });
      secondsLeft -= 0.5;
      if (secondsLeft <= 0) {
        clearInterval(interval);
        // Complete bath, reward XP
        setPetState((current) => {
          if (!current) return null;
          const updated = {
            ...current,
            timesCleaned: current.timesCleaned + 1,
            hygiene: 100,
          };
          const withXp = grantXP(updated, 25); // Clean rewards 25 XP
          saveState(withXp);
          return withXp;
        });
        setActiveAction('none');
      }
    }, 500);
  };

  // Pet/Carinho click interaction
  const handlePetInteraction = () => {
    if (!petState || petState.isSleeping || activeAction !== 'none') return;

    setActiveAction('petted');
    setPetState((current) => {
      if (!current) return null;
      const updated = {
        ...current,
        fun: Math.min(100, current.fun + 6),
      };
      const withXp = grantXP(updated, 3); // each petting rewards 3 XP
      saveState(withXp);
      return withXp;
    });

    setTimeout(() => {
      setActiveAction('none');
    }, 1200);
  };

  // Toggle sleep state
  const handleToggleSleep = () => {
    if (!petState) return;

    setPetState((current) => {
      if (!current) return null;
      const willSleep = !current.isSleeping;
      
      const updated = {
        ...current,
        isSleeping: willSleep,
      };
      
      saveState(updated);
      return updated;
    });

    // If sleeping, close any submenus
    setActiveSubTray('none');
  };

  // Shop Purchases
  const handlePurchaseFood = (food: FoodItem) => {
    // Immediate feed
    handleFeed(food);
  };

  const handlePurchaseAccessory = (acc: CosmicAccessory) => {
    if (!petState) return;
    if (petState.coins < acc.cost) return;

    setPetState((current) => {
      if (!current) return null;
      
      const nextUnlockedSkins = [...current.unlockedSkins];
      const nextUnlockedAccessories = [...current.unlockedAccessories];

      if (acc.type === 'skin') {
        if (!nextUnlockedSkins.includes(acc.id)) nextUnlockedSkins.push(acc.id);
      } else {
        if (!nextUnlockedAccessories.includes(acc.id)) nextUnlockedAccessories.push(acc.id);
      }

      const updated = {
        ...current,
        coins: current.coins - acc.cost,
        unlockedSkins: nextUnlockedSkins,
        unlockedAccessories: nextUnlockedAccessories,
        // Equip immediately
        currentSkin: acc.type === 'skin' ? acc.id : current.currentSkin,
        currentAccessory: acc.type === 'accessory' ? acc.id : current.currentAccessory,
      };

      const withXp = grantXP(updated, 30); // Shopping gives 30 XP!
      saveState(withXp);
      return withXp;
    });
  };

  const handleEquipItem = (id: string, type: 'skin' | 'accessory') => {
    if (!petState) return;

    setPetState((current) => {
      if (!current) return null;
      const updated = {
        ...current,
        currentSkin: type === 'skin' ? id : current.currentSkin,
        currentAccessory: type === 'accessory' ? id : current.currentAccessory,
      };
      saveState(updated);
      return updated;
    });
  };

  // Minigame finish rewards handler
  const handleFinishMinigame = (coins: number, fun: number, xp: number) => {
    if (!petState) return;

    setPetState((current) => {
      if (!current) return null;
      const updated = {
        ...current,
        coins: current.coins + coins,
        fun: Math.min(100, current.fun + fun),
        minigamesPlayed: current.minigamesPlayed + 1,
      };
      const withXp = grantXP(updated, xp);
      saveState(withXp);
      return withXp;
    });

    setActiveGame(null);
  };

  // Reset / Abandon Pet
  const handleAbandon = () => {
    if (window.confirm('Tem certeza que deseja abandonar seu bichinho atual e iniciar uma nova jornada espacial? Todo o progresso será perdido.')) {
      localStorage.removeItem('astro_pet_save');
      setPetState(null);
      setOnboardingName('');
    }
  };

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-[#070715] flex flex-col items-center justify-center text-slate-300 font-sans p-6">
        <div className="w-16 h-16 rounded-full border-4 border-violet-500 border-t-transparent animate-spin mb-4" />
        <h2 className="font-display font-bold text-lg text-white tracking-wide uppercase">Alinhando Sistemas Planetários...</h2>
        <p className="text-xs text-slate-500 font-mono mt-1">Carregando Mascote Virtual</p>
      </div>
    );
  }

  // ONBOARDING / ADOPTION SCREEN
  if (!petState) {
    return (
      <div className="min-h-screen bg-[#09091b] bg-radial from-slate-900/40 via-[#070716] to-[#04040a] flex items-center justify-center p-4">
        {/* Decorative Nebulas */}
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-violet-600/10 blur-[80px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full bg-pink-600/10 blur-[80px] pointer-events-none" />

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-slate-900/90 border border-slate-800/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl w-full max-w-md shadow-2xl flex flex-col relative overflow-hidden"
        >
          {/* Top cosmic badge */}
          <div className="flex items-center gap-1.5 bg-violet-500/10 border border-violet-500/20 px-3 py-1 rounded-full self-start mb-4">
            <Sparkles className="w-3.5 h-3.5 text-violet-400 animate-spin" style={{ animationDuration: '4s' }} />
            <span className="font-mono text-[9px] text-violet-400 font-bold uppercase tracking-wider">Adoção Intergaláctica</span>
          </div>

          <h2 className="font-display font-black text-2xl text-white tracking-tight leading-tight">
            Adote um Mascote Cósmico!
          </h2>
          <p className="text-slate-400 text-xs leading-relaxed mt-2">
            Bem-vindo ao observatório orbital! Um filhote de criatura espacial precisa de um guardião. Dê um nome a ele e escolha seu visual inicial.
          </p>

          <div className="space-y-4 mt-6">
            {/* Name Input */}
            <div>
              <label htmlFor="pet_name_input" className="block font-display font-semibold text-xs text-slate-300 mb-1.5">
                Nome do seu Mascotinho:
              </label>
              <input
                id="pet_name_input"
                type="text"
                maxLength={14}
                value={onboardingName}
                onChange={(e) => setOnboardingName(e.target.value)}
                placeholder="Ex: Cosmo, Lumina, Ziggy, Estelar..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all font-display font-medium"
              />
            </div>

            {/* Skin Selector */}
            <div>
              <label className="block font-display font-semibold text-xs text-slate-300 mb-2">
                Cor de Pele Inicial:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'skin_classic', name: 'Clássico', color: 'bg-blue-500 border-blue-400', desc: 'Azul Espacial' },
                  { id: 'skin_galaxy', name: 'Galáxia', color: 'bg-purple-500 border-purple-400', desc: 'Púrpura Estelar' },
                  { id: 'skin_neon', name: 'Supernova', color: 'bg-emerald-500 border-emerald-400', desc: 'Verde Neon' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setOnboardingSkin(item.id)}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer ${
                      onboardingSkin === item.id
                        ? 'border-violet-500 bg-violet-950/20 shadow-md ring-1 ring-violet-500/20'
                        : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full border shadow-md ${item.color}`} />
                    <div>
                      <span className="block font-display font-bold text-[10px] text-slate-200">{item.name}</span>
                      <span className="block text-[8px] text-slate-500">{item.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleAdopt}
            disabled={!onboardingName.trim()}
            className={`mt-7 w-full py-3.5 rounded-2xl font-display font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-lg ${
              onboardingName.trim()
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white cursor-pointer hover:scale-[1.01]'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            🚀 INICIAR JORNADA ESTELAR
          </button>
          
          <div className="mt-4 text-center">
            <span className="text-[9px] text-slate-500 font-mono">
              Adopted pets are auto-saved to your local galactic drive.
            </span>
          </div>
        </motion.div>
      </div>
    );
  }

  // Calculate age (days/hours/minutes since birthday)
  const petAgeMinutes = Math.floor((Date.now() - petState.birthday) / 60000);
  const ageDisplay = 
    petAgeMinutes < 60 
      ? `${petAgeMinutes} min` 
      : petAgeMinutes < 1440 
      ? `${Math.floor(petAgeMinutes / 60)}h ${petAgeMinutes % 60}m` 
      : `${Math.floor(petAgeMinutes / 1440)}d ${Math.floor((petAgeMinutes % 1440) / 60)}h`;

  return (
    <div className="min-h-screen bg-[#0c051a] text-white p-4 sm:p-6 lg:p-8 flex flex-col justify-between gap-6 relative overflow-hidden font-sans">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/30 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-[150px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col flex-1 justify-between gap-6">
        
        {/* 1. TOP HEADER / STAT BAR BAR */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-black/40 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.4)] select-none text-xl">
              👾
            </div>
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5">
                <h1 className="text-3xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 leading-none">AstroPet</h1>
                <span className="px-2 py-0.5 bg-indigo-500/20 border border-indigo-400/30 rounded text-[9px] font-mono uppercase tracking-widest text-indigo-200 max-w-max">
                  Mascote Virtual • Lvl {petState?.level || 1}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Seu companheiro no observatório orbital de NEBULON-7</p>
            </div>
          </div>

          {/* Global economy, age & reset buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Age tag */}
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-md shadow-inner" title="Tempo desde adoção">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-mono text-xs text-indigo-200">Tempo: <b className="text-white">{ageDisplay}</b></span>
            </div>

            {/* Coin total */}
            <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-full" title="Moedas cósmicas de minijogos">
              <span className="text-sm">🪙</span>
              <span className="font-mono text-xs font-bold text-amber-400">{petState.coins} moedas</span>
            </div>

            {/* Reset button */}
            <button
              onClick={handleAbandon}
              className="p-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-red-500/40 hover:bg-red-950/20 hover:text-red-400 text-slate-400 transition-all cursor-pointer"
              title="Adotar outro bichinho"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* 2. MAIN HUB DASHBOARD */}
        <main className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch flex-1">
          
          {/* Left/Middle Column (8 cols): Pet Frame OR Active Minigame */}
          <div className="md:col-span-7 lg:col-span-8 flex flex-col justify-between h-full min-h-[360px]">
            {activeGame === null ? (
              // STATIC PET VIEW
              <PetScreen
                petState={petState}
                activeAction={activeAction}
                onPetClick={handlePetInteraction}
                activeFoodId={activeFoodId}
              />
            ) : activeGame === 'catcher' ? (
              // STAR CATCHER GAME CONTAINER
              <MinigameCatcher
                petState={petState}
                onFinishGame={handleFinishMinigame}
                onClose={() => setActiveGame(null)}
              />
            ) : (
              // MEMORY MATCH GAME CONTAINER
              <MinigameMemory
                petState={petState}
                onFinishGame={handleFinishMinigame}
                onClose={() => setActiveGame(null)}
              />
            )}
          </div>

          {/* Right Column (4 cols): Needs Stats & Actions Controllers */}
          <div className="md:col-span-5 lg:col-span-4 flex flex-col gap-6 justify-between">
            {/* Vitals Panel */}
            <div className="bg-black/40 border border-white/10 backdrop-blur-xl p-5 rounded-3xl flex-1 flex flex-col justify-between shadow-2xl">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                  <h3 className="font-display font-bold text-xs uppercase tracking-widest text-purple-300">Sinais Vitais & Telemetria</h3>
                </div>
                <StatsBar petState={petState} />
              </div>

              {/* Sleep Mode Warning Block */}
              {petState.isSleeping && (
                <div className="mt-4 bg-indigo-950/30 border border-indigo-500/30 p-3 rounded-2xl text-center">
                  <span className="text-[11px] text-indigo-300 font-medium">
                    💤 {petState.name} está dormindo profundamente para repor as energias. Ações desativadas.
                  </span>
                </div>
              )}
            </div>

            {/* Interaction Controllers Panel */}
            <div className="bg-black/40 border border-white/10 backdrop-blur-xl p-4 rounded-3xl shadow-2xl">
              <ActionControls
                petState={petState}
                activeAction={activeAction}
                activeSubTray={activeSubTray}
                onToggleSubTray={(tray) => {
                  if (activeSubTray === tray) {
                    setActiveSubTray('none');
                  } else {
                    setActiveSubTray(tray);
                  }
                }}
                onFeed={handleFeed}
                onStartBath={handleBath}
                onToggleSleep={handleToggleSleep}
                onOpenShop={() => setIsShopOpen(true)}
                onSelectMinigame={(gameType) => {
                  setActiveGame(gameType);
                  setActiveSubTray('none');
                }}
              />
            </div>

          </div>

        </main>

        {/* 3. LIFETIME STATISTICS & REPLAYABILITY */}
        <footer className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-black/20 border border-white/5 p-4 rounded-2xl text-slate-400 relative">
          <div className="flex items-center gap-2.5">
            <Award className="w-4 h-4 text-amber-500" />
            <span className="text-xs">Fez Refeições: <b className="text-slate-200 font-mono">{petState.timesFed}</b></span>
          </div>
          <div className="flex items-center gap-2.5 border-t sm:border-t-0 sm:border-x border-white/10 pt-2 sm:pt-0 sm:px-4">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-xs">Banhos Tomados: <b className="text-slate-200 font-mono">{petState.timesCleaned}</b></span>
          </div>
          <div className="flex items-center gap-2.5 pt-2 sm:pt-0">
            <Gamepad2 className="w-4 h-4 text-pink-500" />
            <span className="text-xs">Jogos Completados: <b className="text-slate-200 font-mono">{petState.minigamesPlayed}</b></span>
          </div>

          {/* Telemetry Corner text tags overlay for rich sci-fi immersion */}
          <div className="absolute -bottom-1 left-2 hidden lg:block text-[8px] text-white/10 font-mono tracking-widest uppercase">
            SYSTEM STATUS: OPTIMAL
          </div>
          <div className="absolute -bottom-1 right-2 hidden lg:block text-[8px] text-white/10 font-mono tracking-widest uppercase">
            COORD: 45.2.99 / OMEGA
          </div>
        </footer>

        {/* SHOP & WARDROBE MODAL PORTAL */}
        <ShopModal
          isOpen={isShopOpen}
          onClose={() => setIsShopOpen(false)}
          petState={petState}
          onPurchaseFood={handlePurchaseFood}
          onPurchaseAccessory={handlePurchaseAccessory}
          onEquipItem={handleEquipItem}
        />

        {/* LEVEL UP OVERLAY CELEBRATION */}
        <AnimatePresence>
          {showLevelUp && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.8, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 30 }}
                className="bg-slate-900 border-2 border-violet-500/50 p-8 rounded-3xl max-w-sm text-center relative overflow-hidden shadow-2xl flex flex-col items-center"
              >
                {/* Confetti light ray overlay */}
                <div className="absolute inset-0 bg-radial from-violet-600/10 via-transparent to-transparent pointer-events-none" />

                <div className="text-5xl mb-4 animate-bounce">👑</div>
                <h2 className="font-display font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400 uppercase tracking-wider">
                  O Nível Subiu!
                </h2>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  Parabéns! <b>{petState.name}</b> cresceu e evoluiu para o nível estelar <b>{levelUpInfo.newLevel}</b>!
                </p>

                <div className="flex items-center justify-center gap-6 my-6 bg-slate-950 p-4 rounded-2xl border border-slate-800 w-full">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 font-mono">Nível Anterior</span>
                    <span className="text-lg font-bold text-slate-400 font-mono">LV {levelUpInfo.oldLevel}</span>
                  </div>
                  <div className="text-slate-600">▶</div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-violet-400 font-mono">Novo Nível</span>
                    <span className="text-lg font-bold text-violet-400 font-mono">LV {levelUpInfo.newLevel}</span>
                  </div>
                </div>

                {/* Reward */}
                <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-xl mb-6">
                  <span className="text-base">🪙</span>
                  <span className="font-mono text-sm font-bold text-amber-400">+{levelUpInfo.coinReward} Moedas Bônus</span>
                </div>

                <button
                  onClick={() => setShowLevelUp(false)}
                  className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-display font-bold text-xs tracking-wider uppercase rounded-xl shadow-lg transition-transform hover:scale-[1.02] cursor-pointer"
                >
                  Continuar Exploração
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
