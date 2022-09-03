import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FilterControlsComponent } from './filter-controls.component';

describe('FilterControlsComponent', () => {
  let component: FilterControlsComponent;
  let fixture: ComponentFixture<FilterControlsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FilterControlsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
