import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProfilePictureDialogBoxComponent } from './profile-picture-dialog-box.component';

describe('ProfilePictureDialogBoxComponent', () => {
  let component: ProfilePictureDialogBoxComponent;
  let fixture: ComponentFixture<ProfilePictureDialogBoxComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfilePictureDialogBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfilePictureDialogBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
