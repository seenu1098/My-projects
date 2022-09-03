import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PinnedWorkflowItemsComponent } from './pinned-workflow-items.component';

describe('PinnedWorkflowItemsComponent', () => {
  let component: PinnedWorkflowItemsComponent;
  let fixture: ComponentFixture<PinnedWorkflowItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PinnedWorkflowItemsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PinnedWorkflowItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
