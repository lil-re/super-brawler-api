import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuthGuard } from '../auth/auth.guard';
import { SearchProfileDto } from './dto/search-profile.dto';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createProfileDto: CreateProfileDto) {
    return this.profilesService.create(createProfileDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.profilesService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.profilesService.findOne(id);
  }

  @Get(':tag/track')
  async track(@Param('tag') tag: string) {
    const profile = await this.profilesService.findOneByTag(tag);

    if (profile?.id) {
      return profile;
    } else {
      // TODO => fetch username from Brawl Stars API
      return await this.profilesService.create({
        tag: tag.includes('#') ? tag : `#${tag}`,
        username: '',
      });
    }
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProfileDto: UpdateProfileDto) {
    return this.profilesService.update(id, updateProfileDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.profilesService.remove(id);
  }

  @UseGuards(AuthGuard)
  @Post('search')
  async search(@Body() searchProfileDto: SearchProfileDto) {
    return await this.profilesService.search(searchProfileDto);
  }
}
