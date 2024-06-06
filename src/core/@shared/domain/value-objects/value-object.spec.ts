import { ValueObject } from './value-object';

class StringValueObject extends ValueObject {
  constructor(readonly value: string) {
    super();
  }
}

describe('ValueObject Unit Tests', () => {
  it('should compare two value objects', () => {
    const vo1 = new StringValueObject('test');
    const vo2 = new StringValueObject('test');

    expect(vo1.equals(vo2)).toBeTruthy();
  });

  it('should compare with null', () => {
    const vo = new StringValueObject('test');

    expect(vo.equals(null as any)).toBeFalsy();
  });

  it('should compare with undefined', () => {
    const vo = new StringValueObject('test');

    expect(vo.equals(undefined as any)).toBeFalsy();
  });
});
