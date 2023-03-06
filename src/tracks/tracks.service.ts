import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { ReadStream, Stats } from 'fs';
import * as fs from 'fs';
import * as path from 'path';
import findMetadataByPath, {
  findAlbumArtByPath,
} from 'src/util/getMetadataByPath';

@Injectable()
export class TracksService implements OnModuleInit {
  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.saveTracksOnStorage();
  }

  tracks = [];

  saveTracksOnStorage() {
    const tracksDir = path.join(this.configService.get<string>('TRACKS_PATH'));

    fs.readdir(tracksDir, (_, files) => {
      const allowedFileTypes = ['mp3'];
      files
        .filter((f) => allowedFileTypes.includes(f.split('.')[1]))
        .forEach(async (file) => {
          const songName = file.split('.')[0];
          const metadata = await findMetadataByPath(`${tracksDir}/${file}`);
          this.tracks.push({ songName, ...metadata });
        });
    });
  }

  findAll() {
    return this.tracks;
  }

  async streamTrack(key: string, req: Request, res: Response) {
    const musicPath = path.join(
      `${this.configService.get<string>('TRACKS_PATH')}/${key}.mp3`,
    );

    let stat: Stats;

    try {
      stat = fs.statSync(musicPath);
    } catch (e) {
      throw new NotFoundException('Unable to find the song');
    }

    const range = req.headers.range;

    let readStream: ReadStream;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');

      const partialStart = parts[0];
      const partialEnd = parts[1];

      if (
        (isNaN(Number(partialStart)) && partialStart.length > 1) ||
        (isNaN(Number(partialEnd)) && partialEnd.length > 1)
      ) {
        throw new InternalServerErrorException('Something went wrong');
      }

      const start = parseInt(partialStart, 10);
      const end = partialEnd ? parseInt(partialEnd, 10) : stat.size - 1;
      const contentLength = end - start + 1;

      res.status(206).header({
        'Content-Type': 'audio/mpeg',
        'Content-Length': contentLength,
        'Content-Range': 'bytes ' + start + '-' + end + '/' + stat.size,
      });

      readStream = fs.createReadStream(musicPath, { start: start, end: end });
    } else {
      res.header({
        'Content-Type': 'audio/mpeg',
        'Content-Length': stat.size,
      });
      readStream = fs.createReadStream(musicPath);
    }

    readStream.pipe(res);
  }

  async getMetadata(key: string) {
    const filePath = path.join(
      `${this.configService.get<string>('TRACKS_PATH')}/${key}.mp3`,
    );

    console.log('Find metadata called');
    const metadata = await findMetadataByPath(filePath);
    const image = findAlbumArtByPath(filePath);

    if (metadata) {
      return { songName: key, ...metadata, image };
    } else {
      throw new NotFoundException('Meta not found');
    }
  }

  getAlbumArtFilePath(songName: string): string {
    const tracksDir = path.join(this.configService.get<string>('TRACKS_PATH'));
    const albumArtPath = findAlbumArtByPath(`${tracksDir}/${songName}.mp3`);

    if (albumArtPath) {
      return path.join(tracksDir, albumArtPath);
    }

    throw new NotFoundException('Album art not found');
  }
}
