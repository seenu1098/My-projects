import { TestBed } from '@angular/core/testing';

import { YoroflowDesignService } from './designer.service';

describe('YoroflowDesignService', () => {
  let service: YoroflowDesignService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(YoroflowDesignService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
