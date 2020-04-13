import { Pos } from "../types";
function add(vec1: Pos, vec2: Pos): Pos {
  return [vec1[0] + vec2[0], vec1[1] + vec2[1]];
}
function equal(vec1: Pos, vec2: Pos): boolean {
  return vec1[0] === vec2[0] && vec1[1] === vec2[1];
}
function multiply(vec: Pos, k: number): Pos {
  const result = vec.map((a) => a * k);
  return [result[0], result[1]];
}

function isOpposite(vec1: Pos, vec2: Pos) {
  return equal(add(vec1, vec2), [0, 0]);
}

export { add, multiply, equal, isOpposite };
