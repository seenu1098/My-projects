import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskboardFormDetailsComponent } from './taskboard-form-details.component';

describe('TaskboardFormDetailsComponent', () => {
  let component: TaskboardFormDetailsComponent;
  let fixture: ComponentFixture<TaskboardFormDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaskboardFormDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskboardFormDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
