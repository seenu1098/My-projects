import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormTypeBasedReportComponent } from './form-type-based-report.component';

describe('FormTypeBasedReportComponent', () => {
  let component: FormTypeBasedReportComponent;
  let fixture: ComponentFixture<FormTypeBasedReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormTypeBasedReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormTypeBasedReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
