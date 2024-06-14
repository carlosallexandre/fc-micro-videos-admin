import { CreateCastMemberOutput } from '@core/cast-member/application/use-cases/create-cast-member/create-cast-member.use-case';
import { CastMembersController } from './cast-members.controller';
import { CastMemberTypes } from '@core/cast-member/domain/cast-member-type.vo';
import { CreateCastMemberDto } from './dto/create-cast-member.dto';
import {
  CastMemberCollectionPresenter,
  CastMemberPresenter,
} from './cast-member.presenter';
import {
  UpdateCastMemberInput,
  UpdateCastMemberOutput,
} from '@core/cast-member/application/use-cases/update-cast-member/update-cast-member.use-case';
import { GetCastMemberOutput } from '@core/cast-member/application/use-cases/get-cast-member/get-cast-member.use-case';
import {
  ListCastMembersInput,
  ListCastMembersOutput,
} from '@core/cast-member/application/use-cases/list-cast-members/list-cast-members.use-case';

describe('CastMembersController Unit Tests', () => {
  let controller: CastMembersController;

  beforeEach(async () => {
    controller = new CastMembersController();
  });

  it('should creates a cast member', async () => {
    //Arrange
    const output: CreateCastMemberOutput = {
      id: '9366b7dc-2d71-4799-b91c-c64adb205104',
      name: 'Movie',
      type: CastMemberTypes.ACTOR,
      created_at: new Date(),
    };
    const mockCreateUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    };
    //@ts-expect-error defined part of methods
    controller['createUseCase'] = mockCreateUseCase;

    //Act
    const input: CreateCastMemberDto = {
      name: 'Movie',
      type: 1,
    };
    const presenter = await controller.create(input);

    //Assert
    expect(mockCreateUseCase.execute).toHaveBeenCalledWith(input);
    expect(presenter).toBeInstanceOf(CastMemberPresenter);
    expect(presenter).toStrictEqual(new CastMemberPresenter(output));
  });

  it('should updates a cast member', async () => {
    // Arrange
    const id = '9366b7dc-2d71-4799-b91c-c64adb205104';
    const output: UpdateCastMemberOutput = {
      id,
      name: 'Movie',
      type: CastMemberTypes.ACTOR,
      created_at: new Date(),
    };
    const mockUpdateUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    };
    //@ts-expect-error defined part of methods
    controller['updateUseCase'] = mockUpdateUseCase;

    // Act
    const input: Omit<UpdateCastMemberInput, 'id'> = {
      name: 'Movie',
      type: CastMemberTypes.ACTOR,
    };
    const presenter = await controller.update(id, input);

    // Assert
    expect(mockUpdateUseCase.execute).toHaveBeenCalledWith({ id, ...input });
    expect(presenter).toBeInstanceOf(CastMemberPresenter);
    expect(presenter).toStrictEqual(new CastMemberPresenter(output));
  });

  it('should deletes a cast member', async () => {
    // Arrange
    const id = '9366b7dc-2d71-4799-b91c-c64adb205104';
    const expectedOutput = undefined;
    const mockDeleteUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(expectedOutput)),
    };
    //@ts-expect-error defined part of methods
    controller['deleteUseCase'] = mockDeleteUseCase;

    // Act
    const output = await controller.remove(id);

    // Assert
    expect(mockDeleteUseCase.execute).toHaveBeenCalledWith({ id });
    expect(expectedOutput).toStrictEqual(output);
  });

  it('should get a cast member', async () => {
    // Arrange
    const id = '9366b7dc-2d71-4799-b91c-c64adb205104';
    const output: GetCastMemberOutput = {
      id,
      name: 'Movie',
      type: CastMemberTypes.ACTOR,
      created_at: new Date(),
    };
    const mockGetUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    };
    //@ts-expect-error defined part of methods
    controller['getUseCase'] = mockGetUseCase;

    // Act
    const presenter = await controller.findOne(id);

    // Assert
    expect(mockGetUseCase.execute).toHaveBeenCalledWith({ id });
    expect(presenter).toBeInstanceOf(CastMemberPresenter);
    expect(presenter).toStrictEqual(new CastMemberPresenter(output));
  });

  it('should list cast members', async () => {
    // Arrange
    const output: ListCastMembersOutput = {
      items: [
        {
          id: '9366b7dc-2d71-4799-b91c-c64adb205104',
          name: 'Movie',
          type: CastMemberTypes.ACTOR,
          created_at: new Date(),
        },
      ],
      current_page: 1,
      last_page: 1,
      per_page: 1,
      total: 1,
    };
    const mockListUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    };
    //@ts-expect-error defined part of methods
    controller['listUseCase'] = mockListUseCase;

    // Act
    const searchParams: ListCastMembersInput = {
      page: 1,
      per_page: 2,
      sort: 'name',
      sort_dir: 'desc' as const,
      filter: { name: 'test', type: 1 },
    };
    const presenter = await controller.search(searchParams);

    // Assert
    expect(presenter).toBeInstanceOf(CastMemberCollectionPresenter);
    expect(mockListUseCase.execute).toHaveBeenCalledWith(searchParams);
    expect(presenter).toEqual(new CastMemberCollectionPresenter(output));
  });
});
