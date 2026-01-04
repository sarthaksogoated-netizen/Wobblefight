
export enum GameState {
  MENU = 'MENU',
  CHARACTER_SELECT = 'CHARACTER_SELECT',
  BATTLE = 'BATTLE',
  GAME_OVER = 'GAME_OVER'
}

export enum FighterState {
  IDLE = 'IDLE',
  WALKING = 'WALKING',
  JUMPING = 'JUMPING',
  ATTACKING = 'ATTACKING',
  HIT = 'HIT',
  FALLEN = 'FALLEN'
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface FighterConfig {
  id: number;
  name: string;
  color: string;
  personality: string;
  catchphrase: string;
}

export interface FighterEntity {
  id: number;
  name: string;
  pos: Vector2;
  vel: Vector2;
  health: number;
  maxHealth: number;
  width: number;
  height: number;
  facing: number; // 1 for right, -1 for left
  state: FighterState;
  color: string;
  isJumping: boolean;
  attackCooldown: number;
  hitStun: number;
  wins: number;
  rotation: number; // For the "flimsy" feel
  wobbleOffset: number;
}

export interface Particle {
  pos: Vector2;
  vel: Vector2;
  life: number;
  color: string;
  size: number;
}
