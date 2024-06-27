import { IStorage } from '@core/@shared/application/storage.interface';

export class InMemoryStorage implements IStorage {
  private storage: Map<string, { data: Buffer; mime_type?: string }> =
    new Map();

  async store(object: {
    data: Buffer;
    mime_type?: string;
    id: string;
  }): Promise<void> {
    this.storage.set(object.id, {
      data: object.data,
      mime_type: object.mime_type,
    });
  }

  async get(id: string): Promise<{ data: Buffer; mime_tpe?: string }> {
    const file = this.storage.get(id);
    if (!file) throw new Error(`File ${id} not found`);
    return file;
  }
}
