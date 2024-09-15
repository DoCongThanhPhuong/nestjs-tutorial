import {
  Body,
  Controller,
  Delete,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UploadService } from './upload.service';

@ApiTags('upload')
@ApiBearerAuth()
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File) {
    const fileName = await this.uploadService.uploadFile(file);
    return fileName;
  }

  @Delete()
  async deleteFile(@Body('fileKey') fileKey: string): Promise<void> {
    await this.uploadService.deleteFile(fileKey);
  }
}
