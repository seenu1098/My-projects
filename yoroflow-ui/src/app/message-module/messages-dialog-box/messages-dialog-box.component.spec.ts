import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MessagesDialogBoxComponent } from './messages-dialog-box.component';

describe('MessagesDialogBoxComponent', () => {
  let component: MessagesDialogBoxComponent;
  let fixture: ComponentFixture<MessagesDialogBoxComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MessagesDialogBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MessagesDialogBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
