import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LaunchTaskboardDialogComponent } from './launch-taskboard-dialog.component';

describe('LaunchTaskboardDialogComponent', () => {
  let component: LaunchTaskboardDialogComponent;
  let fixture: ComponentFixture<LaunchTaskboardDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LaunchTaskboardDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LaunchTaskboardDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
