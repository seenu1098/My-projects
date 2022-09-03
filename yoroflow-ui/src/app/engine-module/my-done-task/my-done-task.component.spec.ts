import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MyDoneTaskComponent } from './my-done-task.component';

describe('MyDoneTaskComponent', () => {
  let component: MyDoneTaskComponent;
  let fixture: ComponentFixture<MyDoneTaskComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MyDoneTaskComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyDoneTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
