import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable CORS for MCP client access
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Serve static files for Web UI
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    // prefix: '/',
    index: 'index.html',
  });

  await app.listen(4000);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Web UI available at: ${await app.getUrl()}/`);
  console.log(`API available at: ${await app.getUrl()}/api/`);
}
bootstrap();
