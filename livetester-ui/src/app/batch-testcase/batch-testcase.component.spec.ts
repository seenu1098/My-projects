import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BatchTestcaseComponent } from './batch-testcase.component';

describe('BatchTestcaseComponent', () => {
  let component: BatchTestcaseComponent;
  let fixture: ComponentFixture<BatchTestcaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BatchTestcaseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BatchTestcaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
