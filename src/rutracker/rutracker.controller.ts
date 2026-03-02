import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  Body,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { RutrackerService } from './rutracker.service';
import { ConfigService } from '@nestjs/config';
import { CONFIG } from '../config';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api/rutracker')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RutrackerController {
  private readonly ETA_SPEED: number;

  constructor(
    private readonly rutrackerService: RutrackerService,
    private readonly configService: ConfigService,
  ) {
    this.ETA_SPEED = this.configService.get<number>(CONFIG.RUTRACKER.ETA_SPEED, 100);
  }

  @Post('search')
  async search(@Body() body: { title: string; year?: string; season?: string }) {
    try {
      let query = body.title;
      if (body.year) {
        query += ` ${body.year}`;
      }
      if (body.season) {
        query += ` Сезон: ${body.season}`;
      }

      if (!this.rutrackerService.getLoginStatus()) {
        await this.rutrackerService.login();
      }

      const results = await this.rutrackerService.searchAllPages({ query });

      // Format results
      return results.sort((a, b) => b.seeders - a.seeders).map(result => {
        const sizeInMegabytes = Math.ceil(result.size / 1024 / 1024);
        const etaInMinutes = Math.ceil(sizeInMegabytes / (this.ETA_SPEED / 8) / 60);

        return {
          id: result.id,
          name: result.name,
          size: sizeInMegabytes,
          etaInMinutes: etaInMinutes,
          seeders: result.seeders,
          leechers: result.leechers,
          pubDate: new Date(result.pubDate * 1000).toISOString(),
          forum: result.forum,
          downloadLink: result.downloadLink,
        };
      });
    } catch (error) {
      throw new HttpException(
        `Error searching: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('magnet/:torrentId')
  async getMagnetLink(@Param('torrentId') torrentId: string) {
    try {
      if (!this.rutrackerService.getLoginStatus()) {
        await this.rutrackerService.login();
      }

      const magnetLink = await this.rutrackerService.getMagnetLink(torrentId);
      return { magnetLink };
    } catch (error) {
      throw new HttpException(
        `Error getting magnet link: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('details/:torrentId')
  async getDetails(@Param('torrentId') torrentId: string) {
    try {
      if (!this.rutrackerService.getLoginStatus()) {
        await this.rutrackerService.login();
      }

      const details = await this.rutrackerService.getTorrentDetails({
        id: torrentId,
      });

      return {
        id: details.id,
        title: details.title,
        magnetLink: details.magnetLink,
        downloadLink: details.downloadLink,
        content: details.content,
      };
    } catch (error) {
      throw new HttpException(
        `Error getting details: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('download/:torrentId')
  @Roles('admin')
  async downloadTorrent(@Param('torrentId') torrentId: string) {
    try {
      if (!this.rutrackerService.getLoginStatus()) {
        await this.rutrackerService.login();
      }

      const filePath = await this.rutrackerService.downloadTorrentFile(torrentId);
      return {
        success: true,
        filePath,
        message: 'Torrent file downloaded successfully',
      };
    } catch (error) {
      throw new HttpException(
        `Error downloading torrent: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('status')
  async getStatus() {
    return {
      isLoggedIn: this.rutrackerService.getLoginStatus(),
    };
  }
}
