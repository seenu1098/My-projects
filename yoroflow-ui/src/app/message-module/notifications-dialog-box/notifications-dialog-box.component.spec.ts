import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NotificationsDialogBoxComponent } from './notifications-dialog-box.component';

describe('NotificationsDialogBoxComponent', () => {
  let component: NotificationsDialogBoxComponent;
  let fixture: ComponentFixture<NotificationsDialogBoxComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NotificationsDialogBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationsDialogBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
