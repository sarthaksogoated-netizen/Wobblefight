
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, FighterEntity, FighterState, Particle } from './types';
import { 
  CANVAS_WIDTH, 
  P1_CONTROLS, 
  P2_CONTROLS, 
  CHARACTER_TEMPLATES, 
  MAX_HEALTH 
} from './constants';
import { createFighter, updateFighter } from './components/Fighter';
import Arena from './components/Arena';
import { generateBattleDialogue } from './services/geminiService';
import { Trophy, Swords, RefreshCw, User, Users, Info } from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [p1, setP1] = useState<FighterEntity | null>(null);
  const [p2, setP2] = useState<FighterEntity | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [dialogue, setDialogue] = useState<string>("Welcome to Wobble Warriors!");
  const [winner, setWinner] = useState<FighterEntity | null>(null);
  const [round, setRound] = useState(1);

  const keys = useRef<Set<string>>(new Set());
  const gameLoopRef = useRef<number>();

  // Input Handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => keys.current.add(e.code);
    const handleKeyUp = (e: KeyboardEvent) => keys.current.delete(e.code);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const initGame = (char1Idx: number, char2Idx: number) => {
    const c1 = CHARACTER_TEMPLATES[char1Idx];
    const c2 = CHARACTER_TEMPLATES[char2Idx];
    setP1(createFighter(1, c1.name, c1.color, 200));
    setP2(createFighter(2, c2.name, c2.color, CANVAS_WIDTH - 260));
    setGameState(GameState.BATTLE);
    setParticles([]);
    setWinner(null);
    setRound(1);
    
    generateBattleDialogue(c1.name, c2.name, 'start').then(setDialogue);
  };

  const gameLoop = useCallback(() => {
    if (!p1 || !p2 || gameState !== GameState.BATTLE || winner) return;

    const p1Input = {
      left: keys.current.has(P1_CONTROLS.LEFT),
      right: keys.current.has(P1_CONTROLS.RIGHT),
      up: keys.current.has(P1_CONTROLS.UP),
      punch: keys.current.has(P1_CONTROLS.PUNCH),
      kick: keys.current.has(P1_CONTROLS.KICK),
    };

    const p2Input = {
      left: keys.current.has(P2_CONTROLS.LEFT),
      right: keys.current.has(P2_CONTROLS.RIGHT),
      up: keys.current.has(P2_CONTROLS.UP),
      punch: keys.current.has(P2_CONTROLS.PUNCH),
      kick: keys.current.has(P2_CONTROLS.KICK),
    };

    const newParticles = [...particles].filter(p => p.life > 0);
    
    updateFighter(p1, p1Input, p2, newParticles);
    updateFighter(p2, p2Input, p1, newParticles);

    setP1({ ...p1 });
    setP2({ ...p2 });
    setParticles(newParticles);

    // Win condition
    if (p1.health <= 0 || p2.health <= 0) {
      const winEntity = p1.health <= 0 ? p2 : p1;
      setWinner(winEntity);
      generateBattleDialogue(p1.name, p2.name, 'win').then(setDialogue);
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [p1, p2, gameState, particles, winner]);

  useEffect(() => {
    if (gameState === GameState.BATTLE && !winner) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameState, winner, gameLoop]);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
      {/* Header UI */}
      <div className="mb-6 flex items-center gap-4">
        <Swords className="text-pink-500 w-10 h-10" />
        <h1 className="text-5xl font-bungee tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
          WOBBLE WARRIORS
        </h1>
        <Swords className="text-indigo-500 w-10 h-10" />
      </div>

      {gameState === GameState.MENU && (
        <div className="flex flex-col items-center gap-8 bg-slate-800 p-12 rounded-3xl shadow-2xl border-4 border-slate-700">
          <div className="grid grid-cols-2 gap-8">
            <button 
              onClick={() => setGameState(GameState.CHARACTER_SELECT)}
              className="flex flex-col items-center gap-4 p-8 bg-indigo-600 hover:bg-indigo-500 rounded-2xl transition-all transform hover:scale-105 active:scale-95 shadow-lg group"
            >
              <Users className="w-16 h-16 group-hover:animate-bounce" />
              <span className="font-bungee text-2xl">Local PvP</span>
            </button>
            <button 
              className="flex flex-col items-center gap-4 p-8 bg-slate-700 opacity-50 cursor-not-allowed rounded-2xl"
              title="Coming Soon!"
            >
              <User className="w-16 h-16" />
              <span className="font-bungee text-2xl">vs CPU</span>
            </button>
          </div>
          
          <div className="mt-4 p-4 bg-slate-900/50 rounded-xl border border-slate-600 max-w-md text-sm text-slate-400">
            <div className="flex items-center gap-2 mb-2 font-bold text-slate-300">
              <Info className="w-4 h-4" /> CONTROLS
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-bold text-pink-400">Player 1:</p>
                <p>WASD to Move/Jump</p>
                <p>F / G to Attack</p>
              </div>
              <div>
                <p className="font-bold text-indigo-400">Player 2:</p>
                <p>ARROWS to Move/Jump</p>
                <p>/ / . to Attack</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {gameState === GameState.CHARACTER_SELECT && (
        <div className="bg-slate-800 p-8 rounded-3xl shadow-2xl border-4 border-slate-700 w-full max-w-4xl">
          <h2 className="text-3xl font-bungee mb-8 text-center text-yellow-400">Select Your Wobblers</h2>
          <div className="grid grid-cols-3 gap-6">
            {CHARACTER_TEMPLATES.map((char, idx) => (
              <button
                key={idx}
                onClick={() => initGame(idx, (idx + 1) % CHARACTER_TEMPLATES.length)}
                className="flex flex-col items-center p-6 rounded-2xl border-4 transition-all hover:scale-105"
                style={{ backgroundColor: `${char.color}22`, borderColor: char.color }}
              >
                <div 
                  className="w-20 h-28 rounded-full mb-4 shadow-inner wobble-anim"
                  style={{ backgroundColor: char.color }}
                />
                <span className="font-bungee text-xl" style={{ color: char.color }}>{char.name}</span>
                <span className="text-xs text-slate-400 mt-2">{char.personality}</span>
              </button>
            ))}
          </div>
          <button 
            onClick={() => setGameState(GameState.MENU)}
            className="mt-8 text-slate-400 hover:text-white transition-colors"
          >
            ← Back to Menu
          </button>
        </div>
      )}

      {gameState === GameState.BATTLE && p1 && p2 && (
        <div className="relative">
          {/* Health Bars Overlay */}
          <div className="absolute top-8 left-0 right-0 flex justify-between px-10 z-10">
            <div className="w-1/3">
              <div className="flex justify-between items-end mb-1">
                <span className="font-bungee text-2xl" style={{ color: p1.color }}>{p1.name}</span>
                <span className="text-sm font-bold">{Math.ceil(p1.health)}%</span>
              </div>
              <div className="h-6 bg-slate-900 rounded-full border-2 border-slate-700 overflow-hidden">
                <div 
                  className="h-full transition-all duration-300 ease-out bg-gradient-to-r from-red-500 to-green-500"
                  style={{ width: `${(p1.health / MAX_HEALTH) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex flex-col items-center justify-center">
              <div className="text-4xl font-bungee text-yellow-400 px-4 py-2 bg-slate-800 rounded-xl border-2 border-slate-700 mb-2">
                ROUND {round}
              </div>
              <div className="text-xs text-slate-400 max-w-[200px] text-center italic bg-slate-800/80 p-2 rounded-lg">
                "{dialogue}"
              </div>
            </div>

            <div className="w-1/3">
              <div className="flex justify-between items-end mb-1">
                <span className="text-sm font-bold">{Math.ceil(p2.health)}%</span>
                <span className="font-bungee text-2xl text-right" style={{ color: p2.color }}>{p2.name}</span>
              </div>
              <div className="h-6 bg-slate-900 rounded-full border-2 border-slate-700 overflow-hidden flex justify-end">
                <div 
                  className="h-full transition-all duration-300 ease-out bg-gradient-to-l from-red-500 to-green-500"
                  style={{ width: `${(p2.health / MAX_HEALTH) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <Arena p1={p1} p2={p2} particles={particles} />

          {winner && (
            <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center z-20 rounded-xl">
              <Trophy className="w-24 h-24 text-yellow-400 mb-4 animate-bounce" />
              <h2 className="text-6xl font-bungee text-white mb-2" style={{ color: winner.color }}>
                {winner.name} WINS!
              </h2>
              <p className="text-slate-400 text-xl italic mb-8">"{dialogue}"</p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setGameState(GameState.CHARACTER_SELECT)}
                  className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bungee text-xl flex items-center gap-2"
                >
                  <RefreshCw /> Play Again
                </button>
                <button 
                  onClick={() => setGameState(GameState.MENU)}
                  className="px-8 py-4 bg-slate-700 hover:bg-slate-600 rounded-xl font-bungee text-xl"
                >
                  Main Menu
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Footer Info */}
      <div className="mt-8 text-slate-500 text-sm flex gap-6">
        <span>v1.0.0-wobble</span>
        <span>AI Dialogues Powered by Gemini</span>
        <span>Local Shared Keyboard Play</span>
      </div>
    </div>
  );
};

export default App;
