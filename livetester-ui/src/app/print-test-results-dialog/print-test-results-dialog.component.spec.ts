import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintTestResultsDialogComponent } from './print-test-results-dialog.component';

describe('PrintTestResultsDialogComponent', () => {
  let component: PrintTestResultsDialogComponent;
  let fixture: ComponentFixture<PrintTestResultsDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrintTestResultsDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintTestResultsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
