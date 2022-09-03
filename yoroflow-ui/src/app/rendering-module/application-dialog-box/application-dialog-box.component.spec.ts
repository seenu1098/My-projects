import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ApplicationDialogBoxComponent } from './application-dialog-box.component';

describe('ApplicationDialogBoxComponent', () => {
  let component: ApplicationDialogBoxComponent;
  let fixture: ComponentFixture<ApplicationDialogBoxComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ApplicationDialogBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationDialogBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
