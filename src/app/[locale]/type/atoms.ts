import { differenceInMilliseconds } from 'date-fns';
import { useForceUpdate } from 'framer-motion';
import { atom, useAtom } from 'jotai';
import { useEffect } from 'react';

import type { Alphabet } from './alphabet';
import { alphabets } from './alphabet';
import { audios } from './audio';

export interface LetterItem {
  letter: Alphabet;
  status: 'correct' | 'error' | 'idle';
}

export type GameStatus = 'finished' | 'idle' | 'typing';

const initialLetters = alphabets.map((char) => ({
  letter: char,
  status: 'idle',
}));

export const lettersAtom = atom(initialLetters);
export const mistakesAtom = atom(0);
export const stepAtom = atom(0);
export const isFinalStepAtom = atom(
  (get) => get(stepAtom) === alphabets.length - 1,
);
export const gameStateAtom = atom<GameStatus>('idle');
export const isFinishedAtom = atom((get) => get(gameStateAtom) === 'finished');
export const activeLetterAtom = atom((get) => alphabets[get(stepAtom)]);
export const recordAtom = atom<number | null>(null);

const startTimeAtom = atom(Date.now());
const endTimeAtom = atom(Date.now());

export const useTimeEllipses = () => {
  const [gameState] = useAtom(gameStateAtom);
  const [startTime] = useAtom(startTimeAtom);
  const [endTime] = useAtom(endTimeAtom);
  const [forceUpdate] = useForceUpdate();

  useEffect(() => {
    // eslint-disable-next-line fp/no-let
    let interval: NodeJS.Timer | undefined;

    if (gameState === 'typing')
      interval = setInterval(() => {
        forceUpdate();
      }, 100);
    else if (interval) {
      clearInterval(interval);
      interval = undefined;
    }

    return () => {
      clearInterval(interval);
      interval = undefined;
    };
  }, [forceUpdate, gameState]);

  switch (gameState) {
    case 'idle':
      return null;
    case 'typing':
      return differenceInMilliseconds(Date.now(), startTime);
    case 'finished':
      return differenceInMilliseconds(endTime, startTime);
  }
};

export const isPerfectAtom = atom((get) => get(mistakesAtom) === 0);

export const handleSubmitLetter = atom(null, (get, set, update: Alphabet) => {
  const isCorrect = get(activeLetterAtom) === update;
  const shouldFinish = get(isFinalStepAtom);
  const nextStep = Math.min(alphabets.length - 1, get(stepAtom) + 1);

  if (get(gameStateAtom) === 'idle') {
    set(startTimeAtom, Date.now());
    set(gameStateAtom, 'typing');
  }

  if (shouldFinish) {
    set(gameStateAtom, 'finished');
    set(endTimeAtom, Date.now());
  }

  set(stepAtom, nextStep);
  set(lettersAtom, (prev) =>
    prev.map((value) =>
      value.letter === get(activeLetterAtom)
        ? { letter: value.letter, status: isCorrect ? 'correct' : 'error' }
        : value,
    ),
  );
  if (!isCorrect) set(mistakesAtom, (p) => p + 1);
});

export const handleCorrectAtom = atom(null, (get, set) => {
  if (get(gameStateAtom) === 'typing' && get(stepAtom) > 0)
    set(stepAtom, (p) => p - 1);
});

export const handleReset = atom(null, (_, set) => {
  audios.restart.play();
  set(stepAtom, 0);
  set(mistakesAtom, 0);
  set(gameStateAtom, 'idle');
  set(lettersAtom, initialLetters);
});
