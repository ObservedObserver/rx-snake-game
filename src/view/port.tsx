import React, { useEffect, useState, useContext, useRef, useMemo } from "react";
import {
  interval,
  fromEvent,
  BehaviorSubject,
  Subject,
  Observable,
} from "rxjs";
import * as op from "rxjs/operators";
import { MODES, MODE_SPPED, Pos, DIRECTION_VECTOR, DIRECTIONS } from "../types";
import { add } from "../lib/math";

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

const Port: React.FC<PortProps> = (props) => {
  const { mode } = props;
  const [snakeSpace, setSnakeSpace] = useState<Pos[]>([
    [20, 10],
    [20, 11],
    [20, 12],
  ]);

  // const subject = useMemo(() => new Subject(), [])

  // useEffect(() => {
  //   subject.next(props)
  // }, [props])

  const modeStream = useMemo(() => {
    return new BehaviorSubject(mode);
  }, []);

  const snake$ = useMemo(() => {
    return new BehaviorSubject(snakeSpace);
  }, []);

  // const userControlStream = useMemo(() => {
  //   return new BehaviorSubject(DIRECTION_VECTOR.left);
  // }, [])

  // useEffect(() => {
  //   userEvents.subscribe(direction => {
  //     userControlStream.next(DIRECTION_VECTOR[direction])
  //   })
  // }, [])

  useEffect(() => {
    modeStream.next(mode);
  }, [mode]);

  useEffect(() => {
    snake$.next(snakeSpace);
  }, [snakeSpace]);

  useEffect(() => {
    const userControl$ = userEvents.pipe(
      op.map((direction) => DIRECTION_VECTOR[direction]),
      op.startWith(DIRECTION_VECTOR.left)
    );

    const mode$ = modeStream;

    const nextSnake$ = mode$.pipe(
      op.map((mode) => {
        const interval$ = interval(1000 / MODE_SPPED[mode]);
        return interval$.pipe(
          op.withLatestFrom(userControl$, snake$),
          op.map(([int, userControl, snake]) => {
            let head = [...snake[0]] as [number, number];
            console.log("add", head, snake);
            head = add(head, userControl);
            return [head, ...snake.slice(0, -1)];
          })
        );
      }),
      op.switchAll()
    );

    // modeStream
    //   .pipe(op.map((mode) => interval(1000 / MODE_SPPED[mode])))
    //   .forEach((int) => {
    //     int.subscribe(() => {
    //       setSnakeSpace((snake) => {
    //         let head = [...snake[0]] as [number, number];
    //         console.log("add", head, userControlStream.getValue());
    //         head = add(head, userControlStream.getValue());
    //         return [head, ...snake.slice(0, -1)];
    //       });
    //     });
    //   });

    const subscription = nextSnake$.subscribe(setSnakeSpace);

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
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
      </svg>
    </div>
  );
};

export default Port;
