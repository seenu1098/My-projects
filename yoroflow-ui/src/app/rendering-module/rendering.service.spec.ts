import { TestBed } from '@angular/core/testing';

import { YoroappsRenderingLibService } from './rendering.service';

describe('YoroappsRenderingLibService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: YoroappsRenderingLibService = TestBed.get(YoroappsRenderingLibService);
    expect(service).toBeTruthy();
  });
});
