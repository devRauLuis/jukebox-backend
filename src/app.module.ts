import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TracksModule } from './tracks/tracks.module';
import { TracksQueueModule } from './tracks-queue/tracks-queue.module';
import { ConfigModule } from '@nestjs/config';
import { MorganMiddleware } from './middlewares/morgan.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TracksModule,
    TracksQueueModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MorganMiddleware).forRoutes('*');
  }
}
