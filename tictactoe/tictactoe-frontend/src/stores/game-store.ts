/* eslint-disable @typescript-eslint/no-unused-vars */
import { create } from "zustand"
import MoveInputDto from "../../../dto/game/move.input.dto"
import { socket } from "../api/client"
import { MOVE } from "../../../socket.messages"

export interface GameStore {
    symbol: string,
    turn: string,
    gamestate: string,
    username: string,
    setSymbol: (symbol: string) => void,
    setTurn: (turn: string) => void,
    setGamestate: (gamestate: string) => void,
    setUsername: (username: string) => void,
    performMove: (data: MoveInputDto) => void
}

export const useGameStore = create<GameStore>((set, _get) => ({
    symbol: 'X',
    turn: 'X',
    gamestate: '---------',
    username: '',
    setSymbol: (symbol: string) => {
        set({symbol})
    },
    setTurn: (turn: string) => {
        set({turn})
    },
    setGamestate: (gamestate: string) => {
        set({gamestate})
    },
    setUsername: (username: string) => {
        set({username})
    },
    performMove: (data: MoveInputDto) => {
        socket.emit(MOVE, data)
    }
}))