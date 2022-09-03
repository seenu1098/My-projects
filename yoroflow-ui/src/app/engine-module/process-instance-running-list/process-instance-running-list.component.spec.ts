import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProcessInstanceRunningListComponent } from './process-instance-running-list.component';

describe('ProcessInstanceRunningListComponent', () => {
  let component: ProcessInstanceRunningListComponent;
  let fixture: ComponentFixture<ProcessInstanceRunningListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcessInstanceRunningListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessInstanceRunningListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
