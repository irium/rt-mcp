# WebUI Implementation Plan for Rutracker MCP Server

## Project Analysis

### Current Architecture

Your project is a **NestJS-based MCP (Model Context Protocol) Server** that provides:

1. **Core Services:**
   - RutrackerService: Search, get magnet links, download torrents, get details
   - PlexService: Get media from Plex server
   - TmdbService: Get TV show season information

2. **MCP Tools** (AI-facing API):
   - Exposed via `@rekog/mcp-nest` decorators
   - 4 main Rutracker operations: search, get-magnet, get-details, download-torrent
   - SSE endpoint at `/sse` and POST at `/messages`

3. **Architecture Strengths:**
   - Clean separation: Services → MCP Tools → MCP Protocol
   - Extensible base class pattern for trackers
   - Already using NestJS with proper DI
   - CORS enabled

---

## Proposed Solution: Dual API Pattern

### Overview

Add a **REST Controller layer** alongside the existing MCP layer, both consuming the same services. This creates a "dual-interface" architecture where:

- **MCP Tools** → For AI agents
- **REST Controllers** → For Web UI (human users)

### Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│                  Clients                        │
├──────────────────────┬──────────────────────────┤
│   AI Agents (MCP)    │   Web UI (Browser)       │
└──────────┬───────────┴───────────┬──────────────┘
           │                       │
           ↓                       ↓
┌──────────────────┐    ┌──────────────────┐
│   MCP Module     │    │  REST Controllers│
│  (rutracker.tool)│    │  (rutracker.ctrl)│
└────────┬─────────┘    └─────────┬────────┘
         │                        │
         └──────────┬─────────────┘
                    ↓
         ┌──────────────────┐
         │  Core Services   │
         │ - RutrackerService│
         │ - PlexService    │
         │ - TmdbService    │
         └──────────────────┘
```

---

## Implementation Plan

### Phase 1: Add REST API Controllers

#### 1.1 Create Rutracker Controller

**File:** `src/rutracker/rutracker.controller.ts`

```typescript
import { Controller, Get, Post, Query, Param, Body, HttpException, HttpStatus } from '@nestjs/common';
import { RutrackerService } from './rutracker.service';

@Controller('api/rutracker')
export class RutrackerController {
  constructor(private readonly rutrackerService: RutrackerService) {}

  @Post('search')
  async search(
    @Body() body: { title: string; year?: string; season?: string },
  ) {
    try {
      let query = body.title;
      if (body.year) query += ` ${body.year}`;
      if (body.season) query += ` Сезон: ${body.season}`;

      if (!this.rutrackerService.getLoginStatus()) {
        await this.rutrackerService.login();
      }

      const results = await this.rutrackerService.searchAllPages({ query });

      // Format results
      return results
        .sort((a, b) => b.seeders - a.seeders)
        .map(result => ({
          id: result.id,
          name: result.name,
          size: Math.ceil(result.size / 1024 / 1024), // MB
          seeders: result.seeders,
          leechers: result.leechers,
          pubDate: new Date(result.pubDate * 1000).toISOString(),
          forum: result.forum,
          downloadLink: result.downloadLink,
        }));
    } catch (error) {
      throw new HttpException(
        error.message,
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
        error.message,
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
        id: torrentId 
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
        error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('download/:torrentId')
  async downloadTorrent(@Param('torrentId') torrentId: string) {
    try {
      if (!this.rutrackerService.getLoginStatus()) {
        await this.rutrackerService.login();
      }

      const filePath = await this.rutrackerService.downloadTorrentFile(torrentId);
      return { 
        success: true, 
        filePath,
        message: 'Torrent file downloaded successfully'
      };
    } catch (error) {
      throw new HttpException(
        error.message,
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
```

#### 1.2 Update Rutracker Module

**File:** `src/rutracker/rutracker.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { RutrackerService } from './rutracker.service';
import { RutrackerController } from './rutracker.controller';
import { ConfigModule } from '../config';

@Module({
  imports: [ConfigModule],
  providers: [RutrackerService],
  controllers: [RutrackerController], // Add this
  exports: [RutrackerService],
})
export class RutrackerModule {}
```

---

### Phase 2: Create Static Web UI

#### 2.1 Setup Static File Serving

**Update:** `src/main.ts`

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Serve static files for Web UI
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/',
  });

  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Web UI available at: ${await app.getUrl()}/`);
  console.log(`API available at: ${await app.getUrl()}/api/`);
}
bootstrap();
```

#### 2.2 Create HTML Interface

**File:** `public/index.html`

A modern, responsive single-page application with:
- Search form (title, year, season)
- Results table with sorting
- Actions: View Details, Get Magnet Link, Download .torrent
- Status indicator
- Dark/Light theme toggle

#### 2.3 Add Styling

**File:** `public/styles.css`

Modern CSS with:
- Responsive grid layout
- Card-based design
- Loading states
- Toast notifications
- Mobile-friendly design

#### 2.4 Add JavaScript Logic

**File:** `public/app.js`

Client-side logic for:
- API calls to backend
- DOM manipulation
- State management
- Error handling
- Real-time status updates

---

### Phase 3: Enhanced Features (Optional)

1. **Authentication/Authorization:**
   - Add JWT-based auth for Web UI
   - Protect API endpoints
   - User management

2. **Advanced UI Features:**
   - Pagination for search results
   - Filters (category, size, seeders)
   - Batch operations
   - Download history
   - Favorites/Bookmarks

3. **Real-time Updates:**
   - WebSocket connection for status updates
   - Live download progress
   - Notification system

4. **Integration with Plex:**
   - Show Plex library status
   - Compare search results with library
   - Auto-download missing content

---

## File Structure

```
rt-mcp/
├── src/
│   ├── rutracker/
│   │   ├── rutracker.controller.ts     ← NEW (REST API)
│   │   ├── rutracker.service.ts        ← EXISTING
│   │   ├── rutracker.module.ts         ← UPDATE
│   │   └── ...
│   ├── plex/
│   │   ├── plex.controller.ts          ← NEW (Optional)
│   │   └── ...
│   ├── tmdb/
│   │   ├── tmdb.controller.ts          ← EXISTING (already has one)
│   │   └── ...
│   └── main.ts                         ← UPDATE
├── public/                              ← NEW
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   └── favicon.ico
└── docs/
    └── WEBUI_IMPLEMENTATION_PLAN.md    ← THIS FILE
```

---

## API Endpoints Summary

### REST API (for Web UI)
- `POST /api/rutracker/search` - Search torrents
- `GET /api/rutracker/magnet/:id` - Get magnet link
- `GET /api/rutracker/details/:id` - Get torrent details
- `POST /api/rutracker/download/:id` - Download .torrent file
- `GET /api/rutracker/status` - Get login status

### MCP API (for AI)
- `GET /sse` - SSE connection
- `POST /messages` - Tool execution

---

## Benefits of This Approach

1. **Code Reuse:** Both MCP tools and REST controllers use the same service layer
2. **Maintainability:** Single source of truth for business logic
3. **Scalability:** Easy to add new endpoints or tools
4. **Separation of Concerns:** Clear boundaries between AI and human interfaces
5. **No Breaking Changes:** Existing MCP functionality remains intact
6. **Testability:** Can test services independently of interface type

---

## Migration Path

### Minimal Version (Quick Start)
1. Add RutrackerController (1 file)
2. Update RutrackerModule (1 line)
3. Create basic HTML/CSS/JS (3 files)
4. Update main.ts (2 lines)

**Time Estimate:** 2-4 hours

### Full-Featured Version
1. Complete Phase 1 (REST APIs for all services)
2. Complete Phase 2 (Polished UI)
3. Complete Phase 3 (Advanced features)

**Time Estimate:** 1-2 days

---

## Testing Strategy

1. **Unit Tests:** Test controllers independently
2. **Integration Tests:** Test REST API endpoints
3. **E2E Tests:** Test full Web UI flow
4. **Manual Testing:** Browser compatibility

---

## Security Considerations

1. **Rate Limiting:** Add throttling to prevent abuse
2. **CORS Configuration:** Restrict in production
3. **Input Validation:** Use DTOs with class-validator
4. **Authentication:** Add auth guards for sensitive operations
5. **HTTPS:** Use HTTPS in production
6. **Cookie Security:** HttpOnly, Secure, SameSite flags

---

## Next Steps

1. Review this plan
2. Decide on minimal vs full-featured approach
3. I can implement any part of this plan
4. Test and iterate

Would you like me to start implementing the controllers and Web UI?
