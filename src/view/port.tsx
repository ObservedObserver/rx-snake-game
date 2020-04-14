import React, { useEffect, useState, useContext, useRef, useMemo } from "react";
import {
  interval,
  fromEvent,
  BehaviorSubject,
  Subject,
  Observable,
  combineLatest,
} from "rxjs";
import * as op from "rxjs/operators";
import { MODES, MODE_SPPED, Pos, DIRECTION_VECTOR, DIRECTIONS } from "../types";
import { add } from "../lib/math";
import { throwFood, eatFood } from "../lib/food";
import { die } from "../lib/judge";
import { share } from "rxjs/operators";

interface PortProps {
  mode: MODES;
}

const PLAYGROUND = {
  width: 40,
  height: 40,
};

const KEY_MAP: { [key: string]: DIRECTIONS } = {
  A: DIRECTIONS.left,
  W: DIRECTIONS.top,
  S: DIRECTIONS.bottom,
  D: DIRECTIONS.right,
};

const BLOCK_SIZE = 10;
// const userControl$ = fromEvent<KeyboardEvent>(document, "keydown").pipe(
//   op.map((e) => e.key),
//   op.filter((key) => ["w", "a", "s", "d"].includes(key)),
// op.tap((d) => {
//   console.log(d);
// })
// op.audit(() => interval(500)),
// );

// userControl$.subscribe();

const userEvents = fromEvent<KeyboardEvent>(document, "keydown").pipe(
  op.map((e) => KEY_MAP[e.key.toUpperCase()])
);

const INIT_SNAKE: Pos[] = [
  [20, 10],
  [20, 11]
];

const INIT_PLAYGROUND: [Pos, Pos] = [[0, 0], [PLAYGROUND.width, PLAYGROUND.height]];

const Port: React.FC<PortProps> = (props) => {
  const { mode } = props;
  const [snakeSpace, setSnakeSpace] = useState<Pos[]>(INIT_SNAKE);
  const [foodSpace, setFoodSpace] = useState<Pos>(throwFood(INIT_SNAKE, INIT_PLAYGROUND));
  const [round, setRound] = useState<number>(1);

  const mode$ = useMemo(() => {
    return new BehaviorSubject(mode);
  }, []);

  const round$ = useMemo(() => {
    return new BehaviorSubject(round);
  }, []);

  const snake$ = useMemo(() => {
    return new BehaviorSubject(snakeSpace);
  }, []);

  const food$ = useMemo(() => {
    return new BehaviorSubject(foodSpace);
  }, []);

  useEffect(() => {
    mode$.next(mode);
  }, [mode]);

  // useEffect(() => {
  //   snake$.next(snakeSpace);
  // }, [snakeSpace, foodSpace]);

  // useEffect(() => {
  //   food$.next(foodSpace);
  // }, [foodSpace, snakeSpace]);

   useEffect(() => {
     snake$.next(snakeSpace);
   }, [snakeSpace]);

   useEffect(() => {
     food$.next(foodSpace);
   }, [foodSpace]);

  useEffect(() => {
    round$.next(round);
  }, [round])

  useEffect(() => {
    const userControl$ = userEvents.pipe(
      op.filter(direction => typeof direction !== 'undefined'),
      op.map((direction) => DIRECTION_VECTOR[direction]),
      op.startWith(DIRECTION_VECTOR.left)
    );

    const gameStatus$ = combineLatest(mode$, round$).pipe(
      op.map(([mode, round]) => {
        const interval$ = interval(1000 / MODE_SPPED[mode]);
        return interval$.pipe(op.withLatestFrom(userControl$, snake$, food$));
      }),
      op.switchAll(),
      share()
    );

    const nextSnake$ = gameStatus$.pipe(
      op.map(([int, userControl, snake, food]) => {
        let head = [...snake[0]] as [number, number];
        head = add(head, userControl);
        let nextSnake = [head, ...snake.slice(0, -1)];
        if (eatFood(nextSnake, food)) {
          console.log("snake:eat!");
          return [head, ...snake];
        }
        return nextSnake;
      }),
      share(),
    )

    const gameOver$ = nextSnake$.pipe(
      op.map((snake) => die(snake, INIT_PLAYGROUND))
    );

    const nextFood$ = nextSnake$.pipe(
      op.withLatestFrom(food$, gameOver$),
      op.filter(([snake, food, gameOver]) => !gameOver),
      op.map(([snake, food, gameOver]) => {
        if (eatFood(snake, food)) {
          return throwFood(snake, INIT_PLAYGROUND)
        }
        return food
      })
    )

    const snakeSubscription = nextSnake$.subscribe(setSnakeSpace);
    const foodSubscription = nextFood$.subscribe(setFoodSpace);
    const gameOverSubscription = gameOver$.subscribe(isOver => {
      if (isOver) {
        setRound(r => r + 1);
        setSnakeSpace(INIT_SNAKE);
      }
    })
    return () => {
      snakeSubscription.unsubscribe();
      foodSubscription.unsubscribe();
      gameOverSubscription.unsubscribe();
    };
  }, []);

  return (
    <div>
      <ul>
        <li>Rond: {round}</li>
        <li>Score: {snakeSpace.length}</li>
      </ul>
      <div
        style={{
          backgroundColor: "yellow",
          width: PLAYGROUND.width * BLOCK_SIZE,
          height: PLAYGROUND.height * BLOCK_SIZE,
        }}
      >
        <svg
          width={PLAYGROUND.width * BLOCK_SIZE}
          height={PLAYGROUND.height * BLOCK_SIZE}
        >
          <g style={{ fill: "red" }}>
            {snakeSpace.map((pos, index) => (
              <rect
                width={BLOCK_SIZE}
                height={BLOCK_SIZE}
                x={pos[0] * BLOCK_SIZE}
                y={pos[1] * BLOCK_SIZE}
                key={index}
              />
            ))}
          </g>
          <g>
            <rect
              width={BLOCK_SIZE}
              height={BLOCK_SIZE}
              x={foodSpace[0] * BLOCK_SIZE}
              y={foodSpace[1] * BLOCK_SIZE}
            />
          </g>
        </svg>
      </div>
    </div>
  );
};

export default Port;
