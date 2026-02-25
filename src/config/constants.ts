export const MAX_LEASH_LENGTH = 15;
export const LEASH_NODES = 60;
export const SEGMENT_LENGTH = MAX_LEASH_LENGTH / (LEASH_NODES - 1);
export const LEASH_STIFFNESS = 25;
export const LEASH_GRAVITY = -4.0;
export const LEASH_FRICTION = 0.96;
export const SNIFF_RADIUS = 2.5;
export const PLAYER_BASE_SPEED = 7.0;
export const DOG_MOVE_SPEED = 9.0;

export const PHYSICS_SUBSTEPS = 8;
export const FIXED_DELTA = 1 / 60 / PHYSICS_SUBSTEPS;
