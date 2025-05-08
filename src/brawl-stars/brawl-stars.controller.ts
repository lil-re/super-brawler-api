import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { BrawlStarsService } from './brawl-stars.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('brawl-stars')
export class BrawlStarsController {
  constructor(private readonly brawlStarsService: BrawlStarsService) {}

  // @UseGuards(AuthGuard)
  @Get('import/brawlers')
  importBrawlers() {
    return this.brawlStarsService.getBrawlers();
  }
}
