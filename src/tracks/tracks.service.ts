import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { createReadStream, readFileSync, statSync } from 'fs';
import * as fs from 'fs';
import * as path from 'path';
import { TracksStorage } from 'src/tracks/tracks-storage.service';
import { parseFile } from 'music-metadata';
import * as NodeID3 from 'node-id3';
import isImage from 'src/util/isImage';

@Injectable()
export class TracksService implements OnModuleInit {
  constructor(
    private readonly trackStorage: TracksStorage,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    this.saveTracksOnStorage();
  }

  private saveTracksOnStorage() {
    const tracksDir = path.join(this.configService.get<string>('TRACKS_PATH'));

    fs.readdir(tracksDir, (_, files) => {
      files.forEach((file, i) => {
        const trackName = file.split('.')[0];
        this.trackStorage.append({ songName: trackName });
      });
    });
  }

  findAll() {
    return this.trackStorage.toArray();
  }

  async streamTrack(key: string, req: Request, res: Response) {
    const filePath = path.join(
      `${this.configService.get<string>('TRACKS_PATH')}/${key}.mp3`,
    );

    // Create a ReadStream to stream the song file
    const songStream = createReadStream(filePath);
    const stat = statSync(filePath);

    const tags = NodeID3.read(filePath);
    const imageBuffer = (tags.image as any)?.imageBuffer;
    let imageData = null;

    if (imageBuffer) {
      imageData = `data:${
        (tags.image as any).mime
      };base64,${imageBuffer.toString('base64')}`;
    }
    console.log('tags', tags);

    res.writeHead(200, {
      'Content-Type': 'audio/mpeg',
      'Content-Length': stat.size,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Content-Range': `bytes 0-${stat.size - 1}/${stat.size}`,
      'Transfer-Encoding': 'chunked',
      title: tags.title,
      artist: tags.artist,
      album: tags.album,
      year: tags.year,
    });
    // Stream the song file to the client
    songStream.pipe(res);
  }

  async getAlbumArt(key: string, req: Request, res: Response) {
    const filePath = path.join(
      `${this.configService.get<string>('TRACKS_PATH')}/${key}.mp3`,
    );

    const tags = NodeID3.read(filePath);

    if (isImage(tags.image)) {
      const imageBuffer = tags.image.imageBuffer;
      let image = null;

      if (imageBuffer) {
        image = `data:${tags.image.mime};base64,${imageBuffer.toString(
          'base64',
        )}`;
      }
      const {
        title,
        length,
        language,
        trackNumber,
        genre,
        artist,
        releaseTime,
        year,
        album,
      } = tags;

      console.log(tags);

      res.status(200).json({
        title,
        language,
        trackNumber,
        genre,
        artist,
        releaseTime,
        year,
        album,
        length,
        image,
      });
    } else {
      res.status(404).send('Album art not found');
    }
  }
}
