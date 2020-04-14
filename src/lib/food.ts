import { SnakeSpace, Pos, BBox } from "../types";
import { equal } from './math';

function throwFood(space: SnakeSpace, playground: BBox): Pos {
  const [[left, top], [right, bottom]] = playground;
  let food: Pos = [
    left + Math.round(Math.random() * (right - left)),
    top + Math.round(Math.random() * (bottom - top)),
  ];
  // eslint-disable-next-line
  while (space.findIndex((cell) => equal(food, cell)) > -1) {
    food = [
      left + Math.round(Math.random() * (right - left)),
      top + Math.round(Math.random() * (bottom - top)),
    ];
  }
  return food;
}

function eatFood(space: SnakeSpace, food: Pos): boolean {
  return equal(space[0], food);
}

export { throwFood, eatFood };
