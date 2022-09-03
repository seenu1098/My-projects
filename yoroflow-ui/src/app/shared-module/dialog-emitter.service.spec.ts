import { TestBed } from '@angular/core/testing';

import { DialogEmitterService } from './dialog-emitter.service';

describe('DialogEmitterService', () => {
  let service: DialogEmitterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DialogEmitterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
