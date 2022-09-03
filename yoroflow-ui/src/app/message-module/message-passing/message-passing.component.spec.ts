import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MessagePassingComponent } from './message-passing.component';

describe('MessagePassingComponent', () => {
  let component: MessagePassingComponent;
  let fixture: ComponentFixture<MessagePassingComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MessagePassingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MessagePassingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
