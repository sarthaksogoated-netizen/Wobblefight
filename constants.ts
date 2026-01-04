
export const CANVAS_WIDTH = 1000;
export const CANVAS_HEIGHT = 600;
export const GRAVITY = 0.5;
export const GROUND_Y = 500;
export const FRICTION = 0.85;
export const WALK_SPEED = 0.8;
export const MAX_WALK_SPEED = 6;
export const JUMP_FORCE = -15;
export const MAX_HEALTH = 100;

export const P1_CONTROLS = {
  UP: 'KeyW',
  LEFT: 'KeyA',
  RIGHT: 'KeyD',
  PUNCH: 'KeyF',
  KICK: 'KeyG'
};

export const P2_CONTROLS = {
  UP: 'ArrowUp',
  LEFT: 'ArrowLeft',
  RIGHT: 'ArrowRight',
  PUNCH: 'Slash',
  KICK: 'Period'
};

export const CHARACTER_TEMPLATES = [
  { name: 'Bean-o', color: '#f87171', personality: 'Aggressive but clumsy' },
  { name: 'Gloop', color: '#60a5fa', personality: 'Relaxed and unpredictable' },
  { name: 'Wobble-tron', color: '#fbbf24', personality: 'Hyperactive and bouncy' },
  { name: 'Sir Flops-a-lot', color: '#34d399', personality: 'Regal yet unstable' },
  { name: 'Pudding', color: '#a78bfa', personality: 'Sweet but lethal' },
  { name: 'Marshmallow', color: '#ffffff', personality: 'Soft and defensive' }
];
