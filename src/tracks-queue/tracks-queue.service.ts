import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common/exceptions';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';
import findMetadataByPath from 'src/util/getMetadataByPath';
import { TracksQueueGateway } from './tracks-queue.gateway';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TracksQueueService {
  constructor(
    private readonly configService: ConfigService,
    private readonly tracksQueueGateway: TracksQueueGateway,
  ) {}

  trackList = [];
  queue = [];

  onModuleInit() {
    this.saveTracksOnStorage();
    this.tracksQueueGateway.server.on('connection', () => {
      this.tracksQueueGateway.queueUpdated(this.queue);
    });
  }

  saveTracksOnStorage() {
    const tracksDir = path.join(this.configService.get<string>('TRACKS_PATH'));
    console.log('Saving tracks to storage ', tracksDir);

    fs.readdir(tracksDir, (_, files) => {
      files.forEach(async (file) => {
        const songName = file.split('.')[0];
        const metadata = findMetadataByPath(`${tracksDir}/${file}`);
        // console.log(metadata);
        this.trackList.push({ id: uuidv4(), songName, ...metadata });
      });
    });
  }

  addTrackToQueue(payload) {
    const { name } = payload;
    const track = this.trackList.find((s) => s.songName === name);
    console.log('track', track);

    if (track) {
      this.queue.push({
        ...track,
        posId: uuidv4(),
      });
      this.updateSocket();
      return { ...track };
    } else throw new Error(`No matching song found for name '${name}'`);
  }

  queueRandomTrack() {
    const randomIndex = Math.floor(Math.random() * this.trackList.length);
    const randomTrack = this.trackList[randomIndex];

    this.queue.push({
      ...randomTrack,
      posId: uuidv4(),
    });

    this.updateSocket();

    return { ...randomTrack };
  }

  findAllTracks() {
    return this.trackList;
  }

  findAll() {
    return this.queue;
  }

  findNext(idx: number) {
    const track = this.findTrack(idx);
    return track.next.value;
  }

  findPrevious(idx: number) {
    const track = this.findTrack(idx);
    return track.prev.value;
  }

  findTrack(idx: number) {
    const track = this.queue.find((t) => t.songName == idx);

    if (!track)
      throw new NotFoundException(`Unable to get track on position: ${idx}`);

    return track;
  }

  removeTrack(posId: string) {
    const i = this.queue.findIndex((t) => t.posId == posId);
    if (i !== -1) {
      const deleted = this.queue.splice(i, 1);
      this.updateSocket();
      return deleted;
    } else throw new NotFoundException(`Unable to get track on position: ${i}`);
  }

  popQueue() {
    if (this.queue.length < 2) this.queueRandomTrack();
    const deleted = this.queue.shift();

    this.updateSocket();
    return deleted;
  }

  updateSocket() {
    this.tracksQueueGateway.queueUpdated(this.queue);
  }
}
