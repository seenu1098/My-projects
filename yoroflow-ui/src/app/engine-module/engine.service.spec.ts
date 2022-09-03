import { TestBed } from '@angular/core/testing';

import { YoroflowEngineService } from './engine.service';

describe('YoroflowEngineService', () => {
  let service: YoroflowEngineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(YoroflowEngineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
