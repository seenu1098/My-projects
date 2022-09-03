import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TaskPropertyComponent } from './task-property.component';

describe('TaskPropertyComponent', () => {
  let component: TaskPropertyComponent;
  let fixture: ComponentFixture<TaskPropertyComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskPropertyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskPropertyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
