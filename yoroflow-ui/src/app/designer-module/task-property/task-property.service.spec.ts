import { TestBed } from '@angular/core/testing';
import { TaskPropertyService } from './task-property.service';



describe('TaskPropertyService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TaskPropertyService = TestBed.get(TaskPropertyService);
    expect(service).toBeTruthy();
  });
});
