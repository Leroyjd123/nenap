import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateFolderInput, UpdateFolderInput } from '@nenap/types';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/auth-user';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { FoldersService } from './folders.service';

@ApiTags('folders')
@ApiBearerAuth()
@Controller('folders')
export class FoldersController {
  constructor(private readonly folders: FoldersService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.folders.list(user);
  }

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(CreateFolderInput)) body: CreateFolderInput,
  ) {
    return this.folders.create(user, body);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateFolderInput)) body: UpdateFolderInput,
  ) {
    return this.folders.update(user, id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.folders.remove(user, id);
  }
}
