import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TaskFlowComponent } from './task-flow.component';

describe('TaskFlowComponent', () => {
  let component: TaskFlowComponent;
  let fixture: ComponentFixture<TaskFlowComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskFlowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskFlowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
