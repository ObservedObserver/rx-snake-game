export enum MODES {
  easy = 'easy',
  medium = 'medium',
  hard = 'hard'
}

export enum DIRECTIONS {
  left = 'left',
  right = 'right',
  top = 'top',
  bottom = 'bottom'
}

export const MODE_SPPED: { [key in MODES]: number } = {
  easy: 1,
  medium: 2,
  hard: 4
};

export const DIRECTION_VECTOR: { [key in DIRECTIONS]: [number, number] } = {
  left: [-1, 0],
  right: [1, 0],
  top: [0, -1],
  bottom: [0, 1]
}


export type Pos = [number, number];