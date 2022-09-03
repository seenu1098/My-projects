import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NestedSectionComponent } from './nested-section.component';

describe('NestedSectionComponent', () => {
  let component: NestedSectionComponent;
  let fixture: ComponentFixture<NestedSectionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NestedSectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NestedSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
