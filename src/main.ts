import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const PORT = process.env.NODE_PORT || 4000;
  await app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
}
bootstrap();
