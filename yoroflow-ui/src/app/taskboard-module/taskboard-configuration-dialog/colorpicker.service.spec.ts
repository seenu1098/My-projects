import { TestBed } from '@angular/core/testing';

import { ColorpickerService } from './colorpicker.service';

describe('ColorpickerService', () => {
  let service: ColorpickerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ColorpickerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
