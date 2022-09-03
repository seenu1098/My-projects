import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BatchTestcaseResultComponent } from './batch-testcase-result.component';

describe('BatchTestcaseResultComponent', () => {
  let component: BatchTestcaseResultComponent;
  let fixture: ComponentFixture<BatchTestcaseResultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BatchTestcaseResultComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BatchTestcaseResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
