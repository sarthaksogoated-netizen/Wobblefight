
import { 
  FighterEntity, 
  FighterState, 
  Vector2, 
  Particle 
} from '../types';
import { 
  CANVAS_WIDTH, 
  GROUND_Y, 
  GRAVITY, 
  FRICTION, 
  WALK_SPEED, 
  MAX_WALK_SPEED, 
  JUMP_FORCE, 
  MAX_HEALTH 
} from '../constants';

export const createFighter = (id: number, name: string, color: string, x: number): FighterEntity => ({
  id,
  name,
  color,
  pos: { x, y: GROUND_Y - 100 },
  vel: { x: 0, y: 0 },
  health: MAX_HEALTH,
  maxHealth: MAX_HEALTH,
  width: 60,
  height: 80,
  facing: id === 1 ? 1 : -1,
  state: FighterState.IDLE,
  isJumping: false,
  attackCooldown: 0,
  hitStun: 0,
  wins: 0,
  rotation: 0,
  wobbleOffset: Math.random() * Math.PI * 2
});

export const updateFighter = (
  f: FighterEntity, 
  input: { left: boolean; right: boolean; up: boolean; punch: boolean; kick: boolean },
  opponent: FighterEntity,
  particles: Particle[]
) => {
  // Hit stun logic
  if (f.hitStun > 0) {
    f.hitStun--;
    f.state = FighterState.HIT;
  } else {
    // Movement
    if (input.left) {
      f.vel.x -= WALK_SPEED;
      f.facing = -1;
    } else if (input.right) {
      f.vel.x += WALK_SPEED;
      f.facing = 1;
    }

    // Jump
    if (input.up && !f.isJumping) {
      f.vel.y = JUMP_FORCE;
      f.isJumping = true;
      f.state = FighterState.JUMPING;
    }

    // Attacks
    if (f.attackCooldown <= 0) {
      if (input.punch || input.kick) {
        f.state = FighterState.ATTACKING;
        f.attackCooldown = 25;
        checkCollision(f, opponent, input.punch ? 'punch' : 'kick', particles);
      }
    }
  }

  // Physics
  f.vel.x *= FRICTION;
  f.vel.y += GRAVITY;

  // Speed caps
  if (f.vel.x > MAX_WALK_SPEED) f.vel.x = MAX_WALK_SPEED;
  if (f.vel.x < -MAX_WALK_SPEED) f.vel.x = -MAX_WALK_SPEED;

  f.pos.x += f.vel.x;
  f.pos.y += f.vel.y;

  // Ground collision
  if (f.pos.y + f.height > GROUND_Y) {
    f.pos.y = GROUND_Y - f.height;
    f.vel.y = 0;
    f.isJumping = false;
  }

  // Wall collision
  if (f.pos.x < 0) f.pos.x = 0;
  if (f.pos.x + f.width > CANVAS_WIDTH) f.pos.x = CANVAS_WIDTH - f.width;

  // State updates
  if (f.hitStun <= 0 && f.attackCooldown <= 0) {
    if (Math.abs(f.vel.x) > 0.5) {
      f.state = FighterState.WALKING;
    } else {
      f.state = FighterState.IDLE;
    }
  }

  if (f.attackCooldown > 0) f.attackCooldown--;

  // "Flimsy" visuals logic
  f.wobbleOffset += 0.15;
  const targetRotation = (f.vel.x * 0.05) + (Math.sin(f.wobbleOffset) * 0.05);
  f.rotation += (targetRotation - f.rotation) * 0.2;
};

const checkCollision = (
  attacker: FighterEntity, 
  defender: FighterEntity, 
  type: 'punch' | 'kick',
  particles: Particle[]
) => {
  const reach = type === 'punch' ? 60 : 80;
  const damage = type === 'punch' ? 8 : 12;
  
  const hitboxX = attacker.facing === 1 
    ? attacker.pos.x + attacker.width 
    : attacker.pos.x - reach;
  
  const hit = (
    hitboxX < defender.pos.x + defender.width &&
    hitboxX + reach > defender.pos.x &&
    attacker.pos.y < defender.pos.y + defender.height &&
    attacker.pos.y + attacker.height > defender.pos.y
  );

  if (hit) {
    defender.health -= damage;
    defender.hitStun = 15;
    defender.vel.x = attacker.facing * 10;
    defender.vel.y = -5;
    
    // Spawn particles
    for (let i = 0; i < 10; i++) {
      particles.push({
        pos: { x: defender.pos.x + defender.width / 2, y: defender.pos.y + defender.height / 2 },
        vel: { x: (Math.random() - 0.5) * 10, y: (Math.random() - 0.5) * 10 },
        life: 20 + Math.random() * 20,
        color: defender.color,
        size: 4 + Math.random() * 6
      });
    }
  }
};
