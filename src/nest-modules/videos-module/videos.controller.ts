import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  NotImplementedException,
  Inject,
  ParseUUIDPipe,
  UploadedFiles,
  UseInterceptors,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { CreateVideoUseCase } from '@core/video/application/use-cases/create-video/create-video.use-case';
import { UpdateVideoUseCase } from '@core/video/application/use-cases/update-video/update-video.use-case';
import { GetVideoUseCase } from '@core/video/application/use-cases/get-video/get-video.use-case';
import { UploadAudioVideoMediasUseCase } from '@core/video/application/use-cases/upload-audio-video-medias/upload-audio-video-medias.use-case';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UploadImageMediasUseCase } from '@core/video/application/use-cases/upload-image-medias/upload-image-medias.use-case';

@Controller('videos')
export class VideosController {
  @Inject()
  private readonly createUseCase: CreateVideoUseCase;

  @Inject()
  private readonly updateUseCase: UpdateVideoUseCase;

  @Inject()
  private readonly uploadAudioVideoUseCase: UploadAudioVideoMediasUseCase;

  @Inject()
  private readonly uploadImageMediaUseCase: UploadImageMediasUseCase;

  @Inject()
  private readonly getUseCase: GetVideoUseCase;

  @Post()
  async create(@Body() createVideoDto: CreateVideoDto) {
    const { id } = await this.createUseCase.execute(createVideoDto);
    return this.getUseCase.execute({ id });
  }

  @Get(':id')
  findOne(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 })) id: string,
  ) {
    return this.getUseCase.execute({ id });
  }

  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'banner', maxCount: 1 },
      { name: 'thumbnail', maxCount: 1 },
      { name: 'thumbnail_half', maxCount: 1 },
      { name: 'trailer', maxCount: 1 },
      { name: 'video', maxCount: 1 },
    ]),
  )
  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 })) id: string,
    @Body() updateVideoDto: any,
    @UploadedFiles()
    files: {
      banner?: Express.Multer.File[];
      thumbnail?: Express.Multer.File[];
      thumbnail_half?: Express.Multer.File[];
      trailer?: Express.Multer.File[];
      video?: Express.Multer.File[];
    },
  ) {
    const hasData = Object.keys(updateVideoDto).length > 0;
    const hasFiles = files && Object.keys(files).length > 0;

    if (hasFiles && hasData) {
      throw new BadRequestException(
        'Files and and data must not be sent together.',
      );
    }

    if (hasFiles) await this.uploadFile(id, files);
    else await this.updateData(id, updateVideoDto);

    return this.getUseCase.execute({ id });
  }

  private async updateData(id: string, updateVideoDto: UpdateVideoDto) {
    const data = (await new ValidationPipe({
      errorHttpStatusCode: 422,
    }).transform(updateVideoDto, {
      type: 'body',
      metatype: UpdateVideoDto,
    })) as UpdateVideoDto;
    await this.updateUseCase.execute({ id, ...data });
  }

  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'banner', maxCount: 1 },
      { name: 'thumbnail', maxCount: 1 },
      { name: 'thumbnail_half', maxCount: 1 },
      { name: 'trailer', maxCount: 1 },
      { name: 'video', maxCount: 1 },
    ]),
  )
  @Patch(':id/upload')
  async uploadFile(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 })) id: string,
    @UploadedFiles()
    files: {
      banner?: Express.Multer.File[];
      thumbnail?: Express.Multer.File[];
      thumbnail_half?: Express.Multer.File[];
      trailer?: Express.Multer.File[];
      video?: Express.Multer.File[];
    },
  ) {
    const hasMoreThanOneFile = Object.keys(files).length > 1;
    if (hasMoreThanOneFile)
      throw new BadRequestException('Only one file can be sent at a time');

    const field = Object.keys(files)[0] as
      | 'banner'
      | 'thumbnail'
      | 'thumbnail_half'
      | 'trailer'
      | 'video';
    switch (field) {
      case 'trailer':
      case 'video':
        return this.uploadAudioVideoUseCase.execute({
          video_id: id,
          field,
          file: {
            data: files[field][0].buffer,
            mime_type: files[field][0].mimetype,
            raw_name: files[field][0].originalname,
            size: files[field][0].size,
          },
        });
      case 'banner':
      case 'thumbnail':
      case 'thumbnail_half':
        return this.uploadImageMediaUseCase.execute({
          video_id: id,
          field,
          file: {
            data: files[field][0].buffer,
            mime_type: files[field][0].mimetype,
            raw_name: files[field][0].originalname,
            size: files[field][0].size,
          },
        });
    }
  }
}
