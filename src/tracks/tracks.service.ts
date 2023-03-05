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
    console.log('Saving tracks');

    const tracksDir = path.join(this.configService.get<string>('TRACKS_PATH'));

    fs.readdir(tracksDir, (_, files) => {
      const allowedFileTypes = ['mp3'];
      files
        .filter((f) => allowedFileTypes.includes(f.split('.')[1]))
        .forEach(async (file) => {
          const songName = file.split('.')[0];
          const metadata = findMetadataByPath(`${tracksDir}/${file}`);
          // console.log('metadata', metadata);
          this.tracks.push({ songName, ...metadata, image: undefined });
        });
    });
  }

  findAll() {
    return this.tracks;
  }

  // async streamTrack(key: string, req: Request, res: Response) {
  //   const filePath = path.join(
  //     `${this.configService.get<string>('TRACKS_PATH')}/${key}.mp3`,
  //   );

  //   // Create a ReadStream to stream the song file
  //   const songStream = createReadStream(filePath);
  //   const stat = statSync(filePath);

  //   res.writeHead(200, {
  //     'Content-Type': 'audio/mpeg',
  //     'Content-Length': stat.size,
  //     'Accept-Ranges': 'bytes',
  //     'Cache-Control': 'no-cache',
  //     Connection: 'keep-alive',
  //     'Content-Range': `bytes 0-${stat.size - 1}/${stat.size}`,
  //     'Transfer-Encoding': 'chunked',
  //   });

  //   // Stream the song file to the client
  //   songStream.pipe(res);
  // }

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

  async getMetadata(key: string, req: Request, res: Response) {
    const filePath = path.join(
      `${this.configService.get<string>('TRACKS_PATH')}/${key}.mp3`,
    );

    const metadata = findMetadataByPath(filePath);
    const image = findAlbumArtByPath(filePath);

    if (metadata) {
      res.status(200).json({ songName: key, ...metadata, image });
    } else {
      res.status(404).send('Meta not found');
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
