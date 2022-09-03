import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { YoroflowEngineComponent } from './engine.component';

describe('YoroflowEngineComponent', () => {
  let component: YoroflowEngineComponent;
  let fixture: ComponentFixture<YoroflowEngineComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ YoroflowEngineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(YoroflowEngineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
