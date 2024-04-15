import { Module } from '@nestjs/common';
import { GameModule } from './game/game.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [GameModule, PrismaModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
