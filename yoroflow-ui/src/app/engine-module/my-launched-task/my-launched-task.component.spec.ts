import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MyLaunchedTaskComponent } from './my-launched-task.component';

describe('MyLaunchedTaskComponent', () => {
  let component: MyLaunchedTaskComponent;
  let fixture: ComponentFixture<MyLaunchedTaskComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MyLaunchedTaskComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyLaunchedTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
