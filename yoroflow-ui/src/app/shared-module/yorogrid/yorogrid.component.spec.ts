import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { YorogridComponent } from './yorogrid.component';

describe('YorogridComponent', () => {
  let component: YorogridComponent;
  let fixture: ComponentFixture<YorogridComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ YorogridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(YorogridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
