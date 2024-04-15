import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { QueueModule } from 'src/queue/queue.module';
import { SessionModule } from 'src/session/session.module';

@Module({
  imports: [QueueModule, SessionModule],
  providers: [GameService, GameGateway],
})
export class GameModule {}
