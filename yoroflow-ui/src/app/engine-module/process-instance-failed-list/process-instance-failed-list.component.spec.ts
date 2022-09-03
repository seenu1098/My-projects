import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProcessInstanceFailedListComponent } from './process-instance-failed-list.component';

describe('ProcessInstanceFailedListComponent', () => {
  let component: ProcessInstanceFailedListComponent;
  let fixture: ComponentFixture<ProcessInstanceFailedListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcessInstanceFailedListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessInstanceFailedListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
