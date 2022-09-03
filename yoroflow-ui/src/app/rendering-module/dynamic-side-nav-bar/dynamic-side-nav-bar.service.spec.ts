import { TestBed } from '@angular/core/testing';

import { DynamicSideNavBarService } from './dynamic-side-nav-bar.service';

describe('DynamicSideNavBarService', () => {
  let service: DynamicSideNavBarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DynamicSideNavBarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
