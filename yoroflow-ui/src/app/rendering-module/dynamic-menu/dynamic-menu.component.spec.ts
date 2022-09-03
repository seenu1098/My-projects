import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DynamicMenuComponent } from './dynamic-menu.component';

describe('NestedMenuComponent', () => {
  let component: DynamicMenuComponent;
  let fixture: ComponentFixture<DynamicMenuComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DynamicMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
