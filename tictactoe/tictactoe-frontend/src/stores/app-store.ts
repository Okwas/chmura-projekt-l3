/* eslint-disable @typescript-eslint/no-unused-vars */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { StagesType } from '../types';
import { socket } from '../api/client';
import { JOIN_GAME } from '../../../socket.messages';
import JoinDto from '../../../dto/game/join.input.dto';


export interface AppStore {
  stage: StagesType,
  joinGame: (data: JoinDto) => void
  joinGameLoading: boolean,
  setStage: (stage: StagesType) => void
}


export const useAppStore = create<AppStore, [['zustand/devtools', never]]>(
  devtools((set, _get) => ({
    stage: 'login',
    joinGameLoading: false,
    joinGame: (data: JoinDto) => {
        socket.emit(JOIN_GAME, data);
        set({joinGameLoading: true})
    },
    setStage: (stage: StagesType) => {
      set({stage: stage, joinGameLoading: false})
    }
  }))
);
