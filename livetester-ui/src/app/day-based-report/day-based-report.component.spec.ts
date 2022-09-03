import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DayBasedReportComponent } from './day-based-report.component';

describe('DayBasedReportComponent', () => {
  let component: DayBasedReportComponent;
  let fixture: ComponentFixture<DayBasedReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DayBasedReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DayBasedReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
