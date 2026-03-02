import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { RutrackerModule } from './rutracker/rutracker.module';
import { McpServerModule } from './mcp/mcp.module';
import { TmdbModule } from './tmdb/tmdb.module';
import { PlexModule } from './plex/plex.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot(),
    RutrackerModule,
    McpServerModule,
    TmdbModule,
    PlexModule,
    AuthModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
