import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DynamicSideNavBarComponent } from './dynamic-side-nav-bar.component';

describe('DynamicSideNavBarComponent', () => {
  let component: DynamicSideNavBarComponent;
  let fixture: ComponentFixture<DynamicSideNavBarComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DynamicSideNavBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicSideNavBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
