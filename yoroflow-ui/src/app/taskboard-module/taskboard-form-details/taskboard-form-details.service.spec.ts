import { TestBed } from '@angular/core/testing';

import { TaskboardFormDetailsService } from './taskboard-form-details.service';

describe('TaskboardFormDetailsService', () => {
  let service: TaskboardFormDetailsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskboardFormDetailsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
