import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskboardOwnerDialogComponent } from './taskboard-owner-dialog.component';

describe('TaskboardOwnerDialogComponent', () => {
  let component: TaskboardOwnerDialogComponent;
  let fixture: ComponentFixture<TaskboardOwnerDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaskboardOwnerDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskboardOwnerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
