import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ConfirmationDialogBoxComponentComponent } from './confirmation-dialog-box-component.component';

describe('ConfirmationDialogBoxComponentComponent', () => {
  let component: ConfirmationDialogBoxComponentComponent;
  let fixture: ComponentFixture<ConfirmationDialogBoxComponentComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmationDialogBoxComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmationDialogBoxComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
