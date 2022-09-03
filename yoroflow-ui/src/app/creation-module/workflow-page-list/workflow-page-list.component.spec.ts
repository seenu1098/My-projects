import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowPageListComponent } from './workflow-page-list.component';

describe('WorkflowPageListComponent', () => {
  let component: WorkflowPageListComponent;
  let fixture: ComponentFixture<WorkflowPageListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkflowPageListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowPageListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
