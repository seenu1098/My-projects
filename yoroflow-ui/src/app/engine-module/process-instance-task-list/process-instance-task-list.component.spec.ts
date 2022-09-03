import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProcessInstanceTaskListComponent } from './process-instance-task-list.component';

describe('ProcessInstanceTaskListComponent', () => {
  let component: ProcessInstanceTaskListComponent;
  let fixture: ComponentFixture<ProcessInstanceTaskListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcessInstanceTaskListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessInstanceTaskListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
