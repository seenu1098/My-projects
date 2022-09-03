import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskboardReportsComponent } from './taskboard-reports.component';

describe('TaskboardReportsComponent', () => {
  let component: TaskboardReportsComponent;
  let fixture: ComponentFixture<TaskboardReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaskboardReportsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskboardReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
