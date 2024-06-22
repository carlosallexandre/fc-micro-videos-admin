import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Inject,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { CreateGenreUseCase } from '@core/genre/application/use-cases/create-genre/create-genre.use-case';
import { ListGenresUseCase } from '@core/genre/application/use-cases/list-genres/list-genres.use-case';
import { GetGenreUseCase } from '@core/genre/application/use-cases/get-genre/get-genre.use-case';
import { UpdateGenreUseCase } from '@core/genre/application/use-cases/update-genre/update-genre.use-case';
import { DeleteGenreUseCase } from '@core/genre/application/use-cases/delete-genre/delete-genre.use-case';
import { GenreOutput } from '@core/genre/application/use-cases/common/genre-output.mapper';
import { GenreCollectionPresenter, GenrePresenter } from './genres.presenter';
import { UpdateGenreInput } from '@core/genre/application/use-cases/update-genre/update-genre.input';
import { SearchGenresDto } from './dto/search-genres.dto';

@Controller('genres')
export class GenresController {
  @Inject()
  private createUseCase: CreateGenreUseCase;

  @Inject()
  private listUseCase: ListGenresUseCase;

  @Inject()
  private getUseCase: GetGenreUseCase;

  @Inject()
  private updateUseCase: UpdateGenreUseCase;

  @Inject()
  private deleteUseCase: DeleteGenreUseCase;

  @Post()
  async create(@Body() createGenreDto: CreateGenreDto) {
    const output = await this.createUseCase.execute(createGenreDto);
    return GenresController.serialize(output);
  }

  @Get()
  async search(@Query() searchGenresDto: SearchGenresDto) {
    const output = await this.listUseCase.execute(searchGenresDto);
    return new GenreCollectionPresenter(output);
  }

  @Get(':id')
  async findOne(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 })) id: string,
  ) {
    const output = await this.getUseCase.execute({ id });
    return GenresController.serialize(output);
  }

  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 })) id: string,
    @Body() updateGenreDto: UpdateGenreDto,
  ) {
    const input = new UpdateGenreInput({ id, ...updateGenreDto });
    const output = await this.updateUseCase.execute(input);
    return GenresController.serialize(output);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  remove(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 })) id: string,
  ) {
    return this.deleteUseCase.execute({ id });
  }

  static serialize(output: GenreOutput) {
    return new GenrePresenter(output);
  }
}
