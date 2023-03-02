import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import { TracksService } from './tracks.service';
import { Request, Response } from 'express';

@Controller('tracks')
export class TracksController {
  constructor(private readonly tracksService: TracksService) {}

  @Get()
  findAll() {
    return this.tracksService.findAll();
  }

  @Get('stream/:trackId')
  streamTrack(
    @Req() req: Request,
    @Res() res: Response,
    @Param('trackId') key: string,
  ) {
    return this.tracksService.streamTrack(key, req, res);
  }

  @Get('stream/:trackId/art')
  getAlbumArt(
    @Req() req: Request,
    @Res() res: Response,
    @Param('trackId') key: string,
  ) {
    return this.tracksService.getAlbumArt(key, req, res);
  }
}
