import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MessageNotificationComponent } from './message-notification.component';

describe('MessageNotificationComponent', () => {
  let component: MessageNotificationComponent;
  let fixture: ComponentFixture<MessageNotificationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MessageNotificationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MessageNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
