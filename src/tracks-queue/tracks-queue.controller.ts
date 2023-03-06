import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { Delete, Req, Res } from '@nestjs/common/decorators';
import { TracksQueueService } from './tracks-queue.service';
import { Request, Response } from 'express';

@Controller('tracks-queue')
export class TracksQueueController {
  constructor(private readonly tracksQueueService: TracksQueueService) {}

  @Post()
  addTrackToQueue(@Body() payload) {
    return this.tracksQueueService.addTrackToQueue(payload);
  }

  @Post('/queue-random-track')
  queueRandomTrack() {
    return this.tracksQueueService.queueRandomTrack();
  }

  @Get()
  findAll() {
    return this.tracksQueueService.findAll();
  }

  @Get('now-playing')
  findNowPlaying(@Req() req: Request, @Res() res: Response) {
    return this.tracksQueueService.nowPlaying(req, res);
  }

  @Get('/all-tracks')
  findAllTracks(@Param('idx') idx: string) {
    return this.tracksQueueService.findAllTracks();
  }

  @Get('/next/:idx')
  findNext(@Param('idx') idx: string) {
    return this.tracksQueueService.findNext(+idx);
  }

  @Get('/prev/:idx')
  findPrevious(@Param('idx') idx: string) {
    return this.tracksQueueService.findPrevious(+idx);
  }

  @Delete('/pop')
  popQueue() {
    return this.tracksQueueService.popQueue();
  }

  @Delete('/:posId')
  removeTrack(@Param('posId') id: string) {
    return this.tracksQueueService.removeTrack(id);
  }
}
