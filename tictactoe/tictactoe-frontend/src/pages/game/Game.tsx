// import { useGameStore } from "../../stores/game-store"

// export default function Game() {
//   const { symbol, turn, gamestate, username, performMove } = useGameStore()
//   const rows = 3
//   const cols = 3

//   const handleMove = (index: number) => {
//     const newGamestate = gamestate.split("")
//     newGamestate[index] = symbol
//     performMove({ newGamestate: newGamestate.join("") })
//   }

//   return (
//     <div>
//       <h1>Game</h1>
//       <h2>{`You are: ${symbol}`}</h2>
//       <h2>{`Turn: ${turn}`}</h2>
//       <h2>{`Gamestate: ${gamestate}`}</h2>
//       <h2>{`Username: ${username}`}</h2>
//       <div>
//         {[...Array(rows)].map((_, i) => (
//           <div key={i}>
//             {[...Array(cols)].map((_, j) => (
//               <button key={j} onClick={() => handleMove(i * cols + j)}>
//                 {gamestate[i * cols + j]}
//               </button>
//             ))}
//           </div>
//         ))}
//       </div>
//     </div>
//   )
// }

import { useGameStore } from "../../stores/game-store"

export default function Game() {
  const { symbol, turn, gamestate, username, performMove } = useGameStore()
  const rows = 3
  const cols = 3

  const handleMove = (index: number) => {
    const newGamestate = gamestate.split("")
    newGamestate[index] = symbol
    performMove({ newGamestate: newGamestate.join("") })
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 bg-gray-100">
      <h1 className="text-2xl font-bold">Game</h1>
      <div className="text-lg bg-white p-4 rounded-lg shadow-md">
        <h2
          className={`font-semibold ${
            turn === symbol ? "text-green-600" : "text-red-600"
          }`}
        >
          {turn === symbol ? "It's your turn!" : `Waiting for the opponent...`}
        </h2>
        <h2 className="mt-2">{`You are playing as: ${symbol}`}</h2>
        <div className="py-2">
          <h2 className="mt-2">{`Game state: ${gamestate
            .split("")
            .join(" | ")}`}</h2>
          <h2 className="mt-2">{`Your Username: ${username}`}</h2>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[...Array(rows * cols)].map((_, index) => (
          <button
            key={index}
            className="w-16 h-16 md:w-24 md:h-24 bg-gray-200 rounded shadow-md flex items-center justify-center text-xl font-semibold hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => handleMove(index)}
          >
            {gamestate[index]}
          </button>
        ))}
      </div>
    </div>
  )
}
