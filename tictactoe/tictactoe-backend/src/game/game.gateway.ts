import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Socket } from 'socket.io';
import { ConnectedSocket } from '@nestjs/websockets';
import { GameService } from './game.service';
import { DISCONNECT, JOIN_GAME, MOVE } from '../../../socket.messages';
import JoinDto from '../../../dto/game/join.input.dto';
import MoveInputDto from '../../../dto/game/move.input.dto';

// service websocketowy, cała logika odpwowiedzi; wywołania rzeczy z service
@WebSocketGateway(3001, { cors: { origin: ['http://localhost:5173'] } })
export class GameGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly gameService: GameService) {}

  @SubscribeMessage(JOIN_GAME)
  handleJoinGame(
    @MessageBody() data: JoinDto,
    @ConnectedSocket() client: Socket,
  ): void {
    this.gameService.join(
      {
        ...data,
        socketId: client.id,
      },
      this.server,
    );
  }

  @SubscribeMessage(MOVE)
  handleMove(
    @MessageBody() data: MoveInputDto,
    @ConnectedSocket() client: Socket,
  ): void {
    this.gameService.move(
      {
        ...data,
        socketId: client.id,
      },
      this.server,
    );
  }

  @SubscribeMessage(DISCONNECT)
  handleDisconnect(@ConnectedSocket() client: Socket): void {
    this.gameService.disconnect(client.id, this.server);
  }
}
