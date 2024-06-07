import { lastValueFrom, of } from 'rxjs';
import { WrapperDataInterceptor } from './wrapper-data.interceptor';

describe('WrapperDataInterceptor', () => {
  let interceptor: WrapperDataInterceptor;

  beforeEach(() => {
    interceptor = new WrapperDataInterceptor();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should wrap with data key', async () => {
    const data = { name: 'test' };
    const obs$ = interceptor.intercept({} as any, { handle: () => of(data) });
    const result = await lastValueFrom(obs$);
    expect(result).toEqual({ data: data });
  });

  it('should not wrap with meta key present', async () => {
    const data = { data: { name: 'test' }, meta: { total: 1 } };
    const obs$ = interceptor.intercept({} as any, { handle: () => of(data) });
    const result = await lastValueFrom(obs$);
    expect(result).toEqual(data);
  });
});
