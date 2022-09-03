import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MessageNotificationSnackbarComponent } from './message-notification-snackbar.component';

describe('MessageNotificationSnackbarComponent', () => {
  let component: MessageNotificationSnackbarComponent;
  let fixture: ComponentFixture<MessageNotificationSnackbarComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MessageNotificationSnackbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MessageNotificationSnackbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
