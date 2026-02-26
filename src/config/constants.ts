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
  KENNEL: { pos: [-2.6, 1.8, -1.0], lookAt: [-2.6, 1.0, -3.0] }, // Laptop on Desk
  TRAINING: { pos: [-1.4, 1.8, -1.0], lookAt: [-1.4, 1.0, -3.0] }, // Book on Desk
  GEAR: { pos: [3.25, 2.2, 0], lookAt: [3.25, 1.9, -3.4] }, // Standing Closet
  RECORDS: { pos: [-0.9, 2.2, 2.5], lookAt: [-0.9, 2.2, 4.75] }, // Trophy Shelf on South Wall
};
