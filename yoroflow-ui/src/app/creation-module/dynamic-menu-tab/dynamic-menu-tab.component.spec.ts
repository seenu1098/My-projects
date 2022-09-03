import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DynamicMenuTabComponent } from './dynamic-menu-tab.component';

describe('DynamicMenuTabComponent', () => {
  let component: DynamicMenuTabComponent;
  let fixture: ComponentFixture<DynamicMenuTabComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DynamicMenuTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicMenuTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
