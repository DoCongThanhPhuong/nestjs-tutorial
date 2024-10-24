import {
  Body,
  Controller,
  Delete,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { DeleteFileDto } from './dto/delete-file.dto';
import { UploadService } from './upload.service';
import { UploadFileDto } from './dto/upload-file.dto';

@ApiTags('Upload')
@ApiBearerAuth()
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @ApiOperation({ summary: 'Upload a file to S3' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadFileDto })
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File) {
    const fileName = await this.uploadService.uploadFile(file);
    return fileName;
  }

  @ApiOperation({ summary: 'Delete an uploaded file' })
  @Delete()
  async deleteFile(@Body() deleteFileDto: DeleteFileDto): Promise<void> {
    await this.uploadService.deleteFile(deleteFileDto.fileName);
  }
}
