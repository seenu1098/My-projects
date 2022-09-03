import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowdialogComponent } from './workflow-dialog.component';

describe('WorkflowdialogComponent', () => {
  let component: WorkflowdialogComponent;
  let fixture: ComponentFixture<WorkflowdialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkflowdialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowdialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
