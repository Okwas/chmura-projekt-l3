function parseGamestate(gamestate: string): string[][] {
  return [
    [gamestate[0], gamestate[1], gamestate[2]],
    [gamestate[3], gamestate[4], gamestate[5]],
    [gamestate[6], gamestate[7], gamestate[8]],
  ];
}

export function validateMove(
  oldGamestate: string,
  newGamestate: string,
): boolean {
  let diffCount = 0;
  for (let i = 0; i < 9; i++) {
    if (oldGamestate[i] !== newGamestate[i]) {
      if (
        oldGamestate[i] !== '-' ||
        (newGamestate[i] !== 'X' && newGamestate[i] !== 'O')
      ) {
        return false;
      }
      diffCount++;
    }
  }
  return diffCount === 1;
}

export function hasWon(gamestate: string, symbol: string): boolean {
  const parsedGamestate = parseGamestate(gamestate);
  const winConditions = [
    [
      [0, 0],
      [0, 1],
      [0, 2],
    ], // rows
    [
      [1, 0],
      [1, 1],
      [1, 2],
    ],
    [
      [2, 0],
      [2, 1],
      [2, 2],
    ],
    [
      [0, 0],
      [1, 0],
      [2, 0],
    ], // columns
    [
      [0, 1],
      [1, 1],
      [2, 1],
    ],
    [
      [0, 2],
      [1, 2],
      [2, 2],
    ],
    [
      [0, 0],
      [1, 1],
      [2, 2],
    ], // diagonals
    [
      [0, 2],
      [1, 1],
      [2, 0],
    ],
  ];

  return winConditions.some((condition) =>
    condition.every(([x, y]) => parsedGamestate[x][y] === symbol),
  );
}

export function isDraw(gamestate: string): boolean {
  return !gamestate.includes('-');
}

export function nextTurn(turn: string): string {
  return turn === 'X' ? 'O' : 'X';
}
