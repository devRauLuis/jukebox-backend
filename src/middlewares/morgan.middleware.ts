import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import * as morgan from 'morgan';

@Injectable()
export class MorganMiddleware implements NestMiddleware {
  private logger = morgan('combined');

  use(req: Request, res: Response, next: () => void) {
    this.logger(req, res, next);
  }
}
