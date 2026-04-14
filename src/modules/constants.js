// Game Constants and Configuration

export const SCENE_CONFIG = {
    fov: 60,
    near: 0.1,
    far: 100
};

export const CAMERA_POSITION = {
    x: 0,
    y: 3,
    z: 10
};

export const BATSMAN_CONFIG = {
    MIN_X: -1.2,
    MAX_X: 1.2,
    SPEED: 4,
    INITIAL_POSITION: { x: 0, y: 0, z: -5.8 }
};

export const BAT_CONFIG = {
    LOCK_Z: -5.4,
    MIN_X: -1.2,
    MAX_X: 1.2,
    RESPONSE: 18,
    SWING_DURATION: 0.15,
    CONTACT_START: 0.30,
    CONTACT_END: 0.48,
    INITIAL_POSITION: { x: 0.15, y: 0.45, z: -6 },
    INITIAL_ROTATION: { x: -Math.PI / 4, y: Math.PI / 6, z: -Math.PI / 7 }
};

export const BALL_CONFIG = {
    RADIUS: 0.1,
    GEOMETRY_SEGMENTS: 20,
    GRAVITY: 6.2,
    GROUND_Y: 0,
    FRICTION: 0.995,
    VELOCITY_THRESHOLD: 0.8,
    START_POSITION: { x: -0.4, y: 0.85, z: 6.75 },
    BOUNCE_Y: 0.1
};

export const GROUND_CONFIG = {
    RADIUS: 18,
    SEGMENTS: 60,
    BOUNDARY_RADIUS_FACTOR: 0.9
};

export const PITCH_CONFIG = {
    WIDTH: 5,
    LENGTH: 15
};

export const WICKET_CONFIG = {
    BOWLER_POSITIONS: [
        { x: 0.1, y: 0, z: -7 },
        { x: 0.4, y: 0, z: -7 },
        { x: -0.2, y: 0, z: -7 }
    ],
    STRIKER_POSITIONS: [
        { x: 0.1, y: 0, z: 7 },
        { x: 0.4, y: 0, z: 7 },
        { x: -0.2, y: 0, z: 7 }
    ],
    RADIUS: 0.05,
    HEIGHT: 1.2
};

export const BAIL_CONFIG = {
    RADIUS: 0.04,
    HEIGHT: 0.2,
    BOWLER_POSITIONS: [
        { x: -0.05, z: -7 },
        { x: 0.25, z: -7 }
    ],
    STRIKER_POSITIONS: [
        { x: -0.05, z: 7 },
        { x: 0.25, z: 7 }
    ],
    FALL_VELOCITY: -0.06,
    INITIAL_Y: 1.23
};

export const MOVEMENT_KEYS = {
    FORWARD: 'KeyS',
    BACKWARD: 'KeyW',
    LEFT: 'KeyA',
    RIGHT: 'KeyD',
    DOWN: 'KeyQ',
    UP: 'KeyE'
};

export const MOVEMENT_SPEED = 0.15;

export const LIGHTING = {
    AMBIENT_COLOR: 0xffffff,
    AMBIENT_INTENSITY: 1,
    DIRECTIONAL_COLOR: 0xffffff,
    DIRECTIONAL_INTENSITY: 2,
    DIRECTIONAL_POSITION: { x: 5, y: 10, z: 5 }
};

export const BALL_TIME_SCALE = 3.5;
export const BALL_RELEASE_TIME = 0.3;

export const BOWLING_POSITIONS = {
    BOWLER: { x: -1, y: 0, z: 7 },
    BOWLER_ROTATION: { y: Math.PI }
};

export const SCORE_CONFIG = {
    SIX_VALUE: 6,
    FOUR_VALUE: 4,
    ONE_VALUE: 1
};

export const PROBABILITY_CONFIG = {
    LOW_SPEED: {
        threshold: 95,
        sixProbability: 0.9
    },
    MEDIUM_SPEED: {
        threshold: 125,
        sixProbability: 0.7
    },
    HIGH_SPEED: {
        sixProbability: 0.45
    }
};
