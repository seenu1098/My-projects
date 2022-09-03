import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OpenFormDialogBoxComponent } from './open-form-dialog-box.component';

describe('OpenFormDialogBoxComponent', () => {
  let component: OpenFormDialogBoxComponent;
  let fixture: ComponentFixture<OpenFormDialogBoxComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OpenFormDialogBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenFormDialogBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
