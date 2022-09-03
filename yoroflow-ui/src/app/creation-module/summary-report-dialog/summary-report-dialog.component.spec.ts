import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryReportDialogComponent } from './summary-report-dialog.component';

describe('SummaryReportDialogComponent', () => {
  let component: SummaryReportDialogComponent;
  let fixture: ComponentFixture<SummaryReportDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SummaryReportDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SummaryReportDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
