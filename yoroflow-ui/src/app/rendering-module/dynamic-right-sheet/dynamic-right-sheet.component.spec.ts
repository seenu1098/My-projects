import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DynamicRightSheetComponent } from './dynamic-right-sheet.component';

describe('DynamicRightSheetComponent', () => {
  let component: DynamicRightSheetComponent;
  let fixture: ComponentFixture<DynamicRightSheetComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DynamicRightSheetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicRightSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
