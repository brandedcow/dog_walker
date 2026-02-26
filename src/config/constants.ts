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

export const CAMERA_TARGETS = {
  IDLE: { pos: [0, 2.5, 5], lookAt: [0, 1.5, 0] },
  KENNEL: { pos: [-2.6, 1.8, -1.5], lookAt: [-2.6, 0.9, -3.5] }, // Laptop on Desk
  TRAINING: { pos: [-1.4, 1.8, -1.5], lookAt: [-1.4, 0.9, -3.5] }, // Book on Desk
  GEAR: { pos: [2.75, 2.2, -1], lookAt: [2.75, 2.25, -3.5] }, // Standing Closet
  RECORDS: { pos: [-3, 1.8, 2.5], lookAt: [-4.75, 1.5, 2.5] }, // Trophy Shelf on West Wall
};
