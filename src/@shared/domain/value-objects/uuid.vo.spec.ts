import { InvalidUuidError, Uuid } from "./uuid.vo";

describe('Uuid Value Object Unit tests', () => {
  it('should create an uuid', () => {
    const vo = new Uuid();
    expect(vo.value).toBeDefined();
  });

  it('should create with an existing value', () => {
    const value = 'c731d3f4-168f-4fca-a943-7156fe51e085';
    const vo = new Uuid(value);
    expect(vo.value).toEqual(value);
  });

  it('should not create with an invalid value', () => {
    expect(() => new Uuid('invalid-value')).toThrow(InvalidUuidError)
  });
})