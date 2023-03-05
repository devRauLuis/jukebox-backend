import { Module } from '@nestjs/common';
import { TracksQueueService } from './tracks-queue.service';
import { TracksQueueController } from './tracks-queue.controller';
import { TracksQueueStorage } from 'src/tracks-queue/tracks-queue-storage.service';
import { TracksStorage } from 'src/tracks/tracks-storage.service';
import { TracksQueueGateway } from './tracks-queue.gateway';

@Module({
  controllers: [TracksQueueController],
  providers: [
    TracksQueueService,
    TracksQueueStorage,
    TracksStorage,
    TracksQueueGateway,
  ],
})
export class TracksQueueModule {}
