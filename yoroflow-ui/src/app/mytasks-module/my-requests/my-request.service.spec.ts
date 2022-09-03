import { TestBed } from '@angular/core/testing';

import { MyRequestService } from './my-request.service';

describe('MyRequestService', () => {
  let service: MyRequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MyRequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
