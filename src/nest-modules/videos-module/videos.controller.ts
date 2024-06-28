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
} from '@nestjs/common';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { CreateVideoUseCase } from '@core/video/application/use-cases/create-video/create-video.use-case';
import { UpdateVideoUseCase } from '@core/video/application/use-cases/update-video/update-video.use-case';
import { GetVideoUseCase } from '@core/video/application/use-cases/get-video/get-video.use-case';
import { UploadAudioVideoMediasUseCase } from '@core/video/application/use-cases/upload-audio-video-medias/upload-audio-video-medias.use-case';

@Controller('videos')
export class VideosController {
  @Inject()
  private readonly createUseCase: CreateVideoUseCase;

  @Inject()
  private readonly updateUseCase: UpdateVideoUseCase;

  @Inject()
  private readonly uploadAudioVideoUseCase: UploadAudioVideoMediasUseCase;

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

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 })) id: string,
    @Body() updateVideoDto: UpdateVideoDto,
  ) {
    throw new NotImplementedException();
  }

  @Patch(':id/upload')
  uploadFile(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 })) id: string,
  ) {
    throw new NotImplementedException();
  }
}
