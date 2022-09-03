import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProcessInstanceDialogComponentComponent } from './process-instance-dialog-component.component';

describe('ProcessInstanceDialogComponentComponent', () => {
  let component: ProcessInstanceDialogComponentComponent;
  let fixture: ComponentFixture<ProcessInstanceDialogComponentComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcessInstanceDialogComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessInstanceDialogComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
