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
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { DeleteFileDto, UploadFileDto } from './dto';
import { FilesService } from './files.service';

@ApiTags('Files')
@ApiBearerAuth()
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @ApiOperation({ summary: 'Upload file to S3' })
  @ApiOkResponse({ type: String })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadFileDto })
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File): Promise<string> {
    const fileName = await this.filesService.uploadFile(file);
    return fileName;
  }

  @ApiOperation({ summary: 'Delete an uploaded file' })
  @ApiOkResponse()
  @Delete()
  async deleteFile(@Body() deleteFileDto: DeleteFileDto): Promise<void> {
    await this.filesService.deleteFile(deleteFileDto.fileName);
  }
}
