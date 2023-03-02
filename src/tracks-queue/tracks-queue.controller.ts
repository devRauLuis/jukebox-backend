import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { Delete } from '@nestjs/common/decorators';
import { TracksQueueService } from './tracks-queue.service';

@Controller('tracks-queue')
export class TracksQueueController {
  constructor(private readonly tracksQueueService: TracksQueueService) {}

  @Post()
  addTrackToQueue(@Body() payload) {
    return this.tracksQueueService.addTrackToQueue(payload);
  }

  @Get()
  findAll() {
    return this.tracksQueueService.findAll();
  }

  @Get('/next/:idx')
  findNext(@Param('idx') idx: string) {
    return this.tracksQueueService.findNext(+idx);
  }

  @Get('/prev/:idx')
  findPrevious(@Param('idx') idx: string) {
    return this.tracksQueueService.findPrevious(+idx);
  }

  @Delete('/:id')
  removeTrack(@Param('id') id: string) {
    return this.tracksQueueService.removeTrack(+id);
  }
}
