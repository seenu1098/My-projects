import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskboardConfigurationComponent } from './taskboard-configuration.component';

describe('TaskboardConfigurationComponent', () => {
  let component: TaskboardConfigurationComponent;
  let fixture: ComponentFixture<TaskboardConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaskboardConfigurationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskboardConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
