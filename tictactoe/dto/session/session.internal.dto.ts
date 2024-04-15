export default class SessionInternalDto {
  p1socketId: string;
  p2socketId: string;
  p1username: string;
  p2username: string;
}

export class SessionDto extends SessionInternalDto {
  createdAt: Date;
  id: string;
  gamestate: string;
  turn: string;
  p1symbol: string;
  p2symbol: string;
}
