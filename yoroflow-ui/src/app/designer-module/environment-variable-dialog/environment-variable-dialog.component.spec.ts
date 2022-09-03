import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EnvironmentVariableDialogComponent } from './environment-variable-dialog.component';

describe('EnvironmentVariableDialogComponent', () => {
  let component: EnvironmentVariableDialogComponent;
  let fixture: ComponentFixture<EnvironmentVariableDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EnvironmentVariableDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnvironmentVariableDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
