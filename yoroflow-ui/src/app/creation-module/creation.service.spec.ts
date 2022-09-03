import { TestBed } from '@angular/core/testing';

import { YoroappsCreationService } from './creation.service';

describe('YoroappsCreationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: YoroappsCreationService = TestBed.get(YoroappsCreationService);
    expect(service).toBeTruthy();
  });
});
