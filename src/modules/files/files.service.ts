import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import { v4 as uuid } from 'uuid';

@Injectable()
export class FilesService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.bucketName = this.configService.get<string>('AWS_BUCKET_NAME');
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_BUCKET_ACCESS_KEY'),
        secretAccessKey: this.configService.get<string>(
          'AWS_BUCKET_SECRET_KEY',
        ),
      },
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const fileName = `${uuid()}${path.extname(file.originalname)}`;

    const uploadParams = {
      Bucket: this.bucketName,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    try {
      const uploadCommand = new PutObjectCommand(uploadParams);
      await this.s3Client.send(uploadCommand);
      return fileName;
    } catch (error) {
      throw error;
    }
  }

  async getFileUrl(fileName: string): Promise<string> {
    const getObjectParams = {
      Bucket: this.bucketName,
      Key: fileName,
    };

    const getObjectCommand = new GetObjectCommand(getObjectParams);
    const signedUrl = await getSignedUrl(this.s3Client, getObjectCommand, {
      expiresIn: 28800,
    });

    return signedUrl;
  }

  async deleteFile(fileName: string): Promise<void> {
    const params = {
      Bucket: this.bucketName,
      Key: fileName,
    };

    try {
      const command = new DeleteObjectCommand(params);
      await this.s3Client.send(command);
    } catch (error) {
      throw error;
    }
  }
}
