import { Module } from '@nestjs/common';
import { TracksModule } from './tracks/tracks.module';
import { TracksQueueModule } from './tracks-queue/tracks-queue.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TracksModule,
    TracksQueueModule,
  ],
})
export class AppModule {}
