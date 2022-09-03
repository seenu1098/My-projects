import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MyPendingTaskComponent } from './my-pending-task.component';

describe('MyPendingTaskComponent', () => {
  let component: MyPendingTaskComponent;
  let fixture: ComponentFixture<MyPendingTaskComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MyPendingTaskComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyPendingTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
