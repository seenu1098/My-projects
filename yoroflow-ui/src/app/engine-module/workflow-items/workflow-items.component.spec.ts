import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { WorkflowItemsComponent } from './workflow-items.component';

describe('WorkflowItemsComponent', () => {
  let component: WorkflowItemsComponent;
  let fixture: ComponentFixture<WorkflowItemsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkflowItemsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
