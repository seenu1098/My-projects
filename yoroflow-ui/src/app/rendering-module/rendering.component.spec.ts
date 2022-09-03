import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { YoroappsRenderingLibComponent } from './rendering.component';

describe('YoroappsRenderingLibComponent', () => {
  let component: YoroappsRenderingLibComponent;
  let fixture: ComponentFixture<YoroappsRenderingLibComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ YoroappsRenderingLibComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(YoroappsRenderingLibComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
