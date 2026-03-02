import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { User } from '../auth/interfaces/user.interface';

@Injectable()
export class UsersConfigService implements OnModuleInit {
  private readonly logger = new Logger(UsersConfigService.name);
  private users: User[] = [];

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.loadUsers();
  }

  private loadUsers(): void {
    const configPath = this.configService.get<string>(
      'USERS_CONFIG_PATH',
      './config/users.json',
    );

    const absolutePath = path.isAbsolute(configPath)
      ? configPath
      : path.resolve(process.cwd(), configPath);

    try {
      if (!fs.existsSync(absolutePath)) {
        this.logger.warn(
          `Users config file not found at ${absolutePath}. No users loaded.`,
        );
        this.users = [];
        return;
      }

      const fileContent = fs.readFileSync(absolutePath, 'utf-8');
      const data = JSON.parse(fileContent);

      if (!Array.isArray(data.users)) {
        this.logger.error(
          'Invalid users config format: "users" array not found.',
        );
        this.users = [];
        return;
      }

      this.users = data.users;
      this.logger.log(`Loaded ${this.users.length} user(s) from config`);
    } catch (error) {
      this.logger.error(
        `Failed to load users config: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      this.users = [];
    }
  }

  findByUsername(username: string): User | undefined {
    return this.users.find((user) => user.username === username);
  }

  getAllUsers(): Omit<User, 'passwordHash'>[] {
    return this.users.map(({ passwordHash: _, ...user }) => user);
  }
}
