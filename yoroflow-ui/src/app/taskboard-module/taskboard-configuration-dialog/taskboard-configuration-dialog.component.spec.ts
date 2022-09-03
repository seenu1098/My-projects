import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskboardConfigurationDialogComponent } from './taskboard-configuration-dialog.component';

describe('TaskboardConfigurationDialogComponent', () => {
  let component: TaskboardConfigurationDialogComponent;
  let fixture: ComponentFixture<TaskboardConfigurationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaskboardConfigurationDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskboardConfigurationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
