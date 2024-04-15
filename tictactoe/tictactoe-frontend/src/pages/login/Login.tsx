import { useState } from "react"
import { useAppStore } from "../../stores/app-store"
import { useGameStore } from "../../stores/game-store"

export default function Login() {
  const { joinGame, joinGameLoading } = useAppStore()
  const { setUsername } = useGameStore()
  const [localNickname, setLocalNickname] = useState("stefan")
  return (
    <div className="h-screen flex items-center justify-center flex-col bg-gray-100">
      <input
        className="text-lg p-2 border-2 border-gray-300 rounded mb-4 focus:outline-none focus:border-blue-500 transition duration-300"
        value={localNickname}
        onChange={(e) => {
          setLocalNickname(e.target.value)
        }}
        placeholder="Enter your nickname"
      ></input>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        onClick={() => {
          joinGame({ username: localNickname })
          setUsername(localNickname)
        }}
      >
        Play
      </button>
      {joinGameLoading && <div className="text-center mt-4">Loading...</div>}
    </div>
  )
}
