import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LineDrawComponent } from './line-draw.component';

describe('LineDrawComponent', () => {
  let component: LineDrawComponent;
  let fixture: ComponentFixture<LineDrawComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LineDrawComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LineDrawComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
