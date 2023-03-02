import { Injectable } from '@nestjs/common';
import { Circular } from 'src/util/circular';

@Injectable()
export class TracksStorage extends Circular {}
