import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProcessInstanceCompletedListComponent } from './process-instance-completed-list.component';

describe('ProcessInstanceCompletedListComponent', () => {
  let component: ProcessInstanceCompletedListComponent;
  let fixture: ComponentFixture<ProcessInstanceCompletedListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcessInstanceCompletedListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessInstanceCompletedListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
