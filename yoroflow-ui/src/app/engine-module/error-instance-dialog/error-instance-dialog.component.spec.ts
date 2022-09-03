import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorInstanceDialogComponent } from './error-instance-dialog.component';

describe('ErrorInstanceDialogComponent', () => {
  let component: ErrorInstanceDialogComponent;
  let fixture: ComponentFixture<ErrorInstanceDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ErrorInstanceDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorInstanceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
