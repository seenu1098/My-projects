import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { YoroflowDesignComponent } from './designer.component';

describe('YoroflowDesignComponent', () => {
  let component: YoroflowDesignComponent;
  let fixture: ComponentFixture<YoroflowDesignComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ YoroflowDesignComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(YoroflowDesignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
