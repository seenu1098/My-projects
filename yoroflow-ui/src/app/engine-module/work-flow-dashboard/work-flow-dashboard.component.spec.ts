import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { WorkFlowDashboardComponent } from './work-flow-dashboard.component';

describe('WorkFlowDashboardComponent', () => {
  let component: WorkFlowDashboardComponent;
  let fixture: ComponentFixture<WorkFlowDashboardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkFlowDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkFlowDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
