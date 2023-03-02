import { Module } from '@nestjs/common';
import { TracksQueueService } from './tracks-queue.service';
import { TracksQueueController } from './tracks-queue.controller';
import { TracksQueueStorage } from 'src/tracks-queue/tracks-queue-storage.service';

@Module({
  controllers: [TracksQueueController],
  providers: [TracksQueueService, TracksQueueStorage],
})
export class TracksQueueModule {}
