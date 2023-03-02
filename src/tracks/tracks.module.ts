import { Module } from '@nestjs/common';
import { TracksService } from './tracks.service';
import { TracksController } from './tracks.controller';
import { TracksStorage } from 'src/tracks/tracks-storage.service';

@Module({
  controllers: [TracksController],
  providers: [TracksService, TracksStorage],
})
export class TracksModule {}
