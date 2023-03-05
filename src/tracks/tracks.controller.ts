import { TracksQueueService } from './../tracks-queue/tracks-queue.service';
import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import { TracksService } from './tracks.service';
import { Request, Response } from 'express';
import * as fs from 'fs';

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

  @Get(':trackId/meta')
  getMetadata(
    @Req() req: Request,
    @Res() res: Response,
    @Param('trackId') key: string,
  ) {
    return this.tracksService.getMetadata(key, req, res);
  }

  @Get(':trackId/art')
  async getAlbumArt(
    @Req() req: Request,
    @Res() res: Response,
    @Param('trackId') songName: string,
  ) {
    const filePath = this.tracksService.getAlbumArtFilePath(songName);
    const stat = fs.statSync(filePath);

    res.writeHead(200, {
      'Content-Type': 'image/jpeg', // or 'image/png' depending on the file type
      'Content-Length': stat.size,
    });

    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
  }
}
