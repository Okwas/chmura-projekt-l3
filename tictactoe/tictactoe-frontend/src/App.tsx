import Login from "./pages/login/Login"
import { useAppStore } from "./stores/app-store"
import { socket } from "./api/client"
import { useEffect } from "react"
import {
  GAME_FOUND,
  OPPONENT_LEFT,
  AFTER_MOVE,
  GAME_DRAW,
  GAME_WON,
  GAME_LOST,
} from "../../socket.messages"
import EndGame from "./pages/end-game/EndGame"
import { DRAW_STRING, LOST_STRING, WON_STRING } from "./strings"
import Game from "./pages/game/Game"
import SessionOutputDto from "../../dto/session/session.output.dto"
import AfterMoveOutputDto from "../../dto/game/after-move.output.dto"
import { useGameStore } from "./stores/game-store"
import "./index.css"

function App() {
  const { stage, setStage } = useAppStore()
  const { setTurn, setSymbol, setGamestate } = useGameStore()

  useEffect(() => {
    socket.on(GAME_FOUND, ({ turn, symbol, gamestate }: SessionOutputDto) => {
      setStage("game")
      setSymbol(symbol)
      setTurn(turn)
      setGamestate(gamestate)
    })

    socket.on(OPPONENT_LEFT, () => {
      setStage("login")
      console.log("opponent left")
    })

    socket.on(AFTER_MOVE, ({ turn, gamestate }: AfterMoveOutputDto) => {
      console.log("after move")
      setTurn(turn)
      setGamestate(gamestate)
    })

    socket.on(GAME_DRAW, () => {
      setStage("draw")
      console.log("game draw")
    })

    socket.on(GAME_WON, () => {
      setStage("won")
      console.log("game won")
    })

    socket.on(GAME_LOST, () => {
      setStage("lost")
      console.log("game lost")
    })
  }, [])

  switch (stage) {
    case "login":
      return <Login />
    case "game":
      return <Game />
    case "draw":
      return <EndGame text={DRAW_STRING} />
    case "won":
      return <EndGame text={WON_STRING} />
    case "lost":
      return <EndGame text={LOST_STRING} />
    default:
      return <></>
  }
}

export default App
