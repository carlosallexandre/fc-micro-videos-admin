import { Entity } from '@core/@shared/domain/entity';
import { Uuid } from '@core/@shared/domain/value-objects/uuid.vo';
import { NotFoundError } from '@core/@shared/domain/errors/not-found.error';
import { InMemoryRepository } from './in-memory.repository';

class StubEntity extends Entity {
  id: Uuid;
  name: string;
  price: number;

  constructor(props: { id?: Uuid; name: string; price: number }) {
    super();
    this.id = props.id || new Uuid();
    this.name = props.name;
    this.price = props.price;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      price: this.price,
    };
  }
}

class StubInMemoryRepository extends InMemoryRepository<StubEntity, Uuid> {
  getEntity() {
    return StubEntity;
  }
}

describe('InMemoryRepository Unit Tests', () => {
  let repo: StubInMemoryRepository;

  beforeEach(() => {
    repo = new StubInMemoryRepository();
  });

  it('should insert a new entity', async () => {
    const entity = new StubEntity({
      id: new Uuid(),
      name: 'Test',
      price: 100,
    });

    await repo.insert(entity);

    expect(repo.items.length).toBe(1);
    expect(repo.items[0]).toBe(entity);
  });

  it('should bulk insert entities', async () => {
    const entities = [
      new StubEntity({
        id: new Uuid(),
        name: 'Test',
        price: 100,
      }),
      new StubEntity({
        id: new Uuid(),
        name: 'Test',
        price: 100,
      }),
    ];

    await repo.bulkInsert(entities);

    expect(repo.items.length).toBe(2);
    expect(repo.items).toEqual(expect.arrayContaining(entities));
  });

  it('should returns all entities', async () => {
    const entity = new StubEntity({ name: 'Test', price: 100 });
    repo.items.push(entity);

    const entities = await repo.findAll();

    expect(entities).toStrictEqual([entity]);
  });

  it('should throws error on update when entity not found', async () => {
    const entity = new StubEntity({ name: 'Test', price: 100 });

    await expect(repo.update(entity)).rejects.toThrow(NotFoundError);
  });

  it('should updates an entity', async () => {
    const entity = new StubEntity({ name: 'Test', price: 100 });
    repo.items.push(entity);

    const entityToUpdate = new StubEntity({
      id: entity.id,
      name: 'Test updated',
      price: 22,
    });
    await repo.update(entityToUpdate);

    expect(repo.items[0].toJSON()).toStrictEqual(entityToUpdate.toJSON());
  });

  it('should throws error on delete when entity not found', async () => {
    await expect(repo.delete(new Uuid())).rejects.toThrow(NotFoundError);
  });

  it('should deletes an entity', async () => {
    const entity = new StubEntity({ name: 'Test', price: 22 });
    repo.items.push(entity);

    await repo.delete(entity.id);

    expect(repo.items.length).toBe(0);
  });

  // TODO: implementar search/filters/sorts
  it.todo('should search');
});
