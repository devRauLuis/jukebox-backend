import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common/exceptions';
import { TracksQueueStorage } from './tracks-queue-storage.service';

@Injectable()
export class TracksQueueService {
  constructor(private readonly tracksQueueStorage: TracksQueueStorage) {}

  addTrackToQueue(payload) {
    const { name } = payload;

    return this.tracksQueueStorage.append({
      songName: name,
    }).last.value;
  }

  findAll() {
    return this.tracksQueueStorage.toArray();
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
    const track = this.tracksQueueStorage.get(idx);

    if (!track)
      throw new NotFoundException(`Unable to get track on position: ${idx}`);

    return track;
  }

  removeTrack(idx: number) {
    const removed = this.tracksQueueStorage.remove(idx);

    if (!removed)
      throw new NotFoundException(`Unable to remove track on position: ${idx}`);

    return removed?.value;
  }
}
