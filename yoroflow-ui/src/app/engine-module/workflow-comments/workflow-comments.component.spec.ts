import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowCommentsComponent } from './workflow-comments.component';

describe('WorkflowCommentsComponent', () => {
  let component: WorkflowCommentsComponent;
  let fixture: ComponentFixture<WorkflowCommentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkflowCommentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowCommentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
