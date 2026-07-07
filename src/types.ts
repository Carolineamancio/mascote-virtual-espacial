/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PetState {
  name: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  hunger: number; // 0 to 100 (100 = full)
  hygiene: number; // 0 to 100 (100 = clean)
  fun: number; // 0 to 100 (100 = happy)
  energy: number; // 0 to 100 (100 = rested)
  coins: number;
  isSleeping: boolean;
  currentSkin: string; // 'classic' | 'galaxy' | 'neon' | 'magic' | 'void'
  currentAccessory: string; // 'none' | 'glasses' | 'crown' | 'helmet' | 'bow' | 'headphones'
  unlockedSkins: string[];
  unlockedAccessories: string[];
  birthday: number;
  lastUpdate: number;
  timesFed: number;
  timesCleaned: number;
  minigamesPlayed: number;
}

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  hungerGain: number;
  energyGain: number;
  cost: number;
  icon: string; // Emoji or Lucide icon key
  color: string;
}

export interface CosmicAccessory {
  id: string;
  name: string;
  description: string;
  cost: number;
  type: 'skin' | 'accessory';
  color?: string; // For skin
}

// Static Data
export const FOOD_ITEMS: FoodItem[] = [
  {
    id: 'star_candy',
    name: 'Bala Estelar',
    description: 'Um doce que brilha no escuro, feito de poeira de cometa.',
    hungerGain: 15,
    energyGain: 5,
    cost: 5,
    icon: '✨',
    color: 'from-amber-300 to-yellow-500',
  },
  {
    id: 'nebula_cookie',
    name: 'Biscoito Nebulosa',
    description: 'Biscoito crocante recheado com geleia cósmica colorida.',
    hungerGain: 35,
    energyGain: 10,
    cost: 15,
    icon: '🌀',
    color: 'from-purple-400 to-pink-500',
  },
  {
    id: 'lunar_gelato',
    name: 'Gelato Lunar',
    description: 'Refrescante sorvete feito de gelo derretido da Lua.',
    hungerGain: 50,
    energyGain: -5, // Gives brain freeze!
    cost: 25,
    icon: '🍧',
    color: 'from-cyan-400 to-blue-500',
  },
  {
    id: 'supernova_spaghetti',
    name: 'Espaguete Supernova',
    description: 'Nutritivo prato fumegante com almôndegas de meteoro.',
    hungerGain: 85,
    energyGain: 20,
    cost: 50,
    icon: '🍝',
    color: 'from-red-500 to-orange-500',
  },
  {
    id: 'antimatter_potion',
    name: 'Poção de Antimatéria',
    description: 'Bebida misteriosa que satisfaz a fome instantaneamente e dá energia extra.',
    hungerGain: 100,
    energyGain: 40,
    cost: 95,
    icon: '🧪',
    color: 'from-indigo-600 to-fuchsia-600',
  }
];

export const COSMIC_ACCESSORIES: CosmicAccessory[] = [
  // Skins
  {
    id: 'skin_classic',
    name: 'Pele Cósmica Azul',
    description: 'A pele original de um adorável ser do espaço.',
    cost: 0,
    type: 'skin',
    color: '#3b82f6', // blue
  },
  {
    id: 'skin_galaxy',
    name: 'Pele Galáxia Purpúrea',
    description: 'Pele que reflete uma nebulosa cheia de estrelas.',
    cost: 80,
    type: 'skin',
    color: '#8b5cf6', // violet
  },
  {
    id: 'skin_neon',
    name: 'Pele Supernova Neon',
    description: 'Pele que brilha intensamente nas cores de uma supernova.',
    cost: 150,
    type: 'skin',
    color: '#10b981', // emerald / green
  },
  {
    id: 'skin_void',
    name: 'Pele Vácuo Profundo',
    description: 'Pele misteriosa feita da matéria escura do universo.',
    cost: 300,
    type: 'skin',
    color: '#312e81', // dark indigo
  },
  
  // Accessories
  {
    id: 'acc_none',
    name: 'Sem Acessório',
    description: 'Deixe seu bichinho livre e confortável.',
    cost: 0,
    type: 'accessory',
  },
  {
    id: 'acc_glasses',
    name: 'Óculos de Ciclope',
    description: 'Para analisar estrelas com precisão científica!',
    cost: 45,
    type: 'accessory',
  },
  {
    id: 'acc_crown',
    name: 'Coroa Imperial',
    description: 'Coroa estelar para proclamar seu bichinho o rei do universo.',
    cost: 120,
    type: 'accessory',
  },
  {
    id: 'acc_helmet',
    name: 'Capacete de Astronauta',
    description: 'Equipamento de exploração vintage de alta tecnologia.',
    cost: 180,
    type: 'accessory',
  },
  {
    id: 'acc_headphones',
    name: 'Fones de Ouvido Estelares',
    description: 'Para escutar ondas de rádio cósmicas e lo-fi espacial.',
    cost: 90,
    type: 'accessory',
  },
  {
    id: 'acc_bow',
    name: 'Laço Mágico de Gravidade',
    description: 'Um lindo laço flutuante rosa com forças de atração gravitacional.',
    cost: 60,
    type: 'accessory',
  }
];
