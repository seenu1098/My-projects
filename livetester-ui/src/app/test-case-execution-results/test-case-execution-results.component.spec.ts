import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestCaseExecutionResultsComponent } from './test-case-execution-results.component';

describe('TestCaseExecutionResultsComponent', () => {
  let component: TestCaseExecutionResultsComponent;
  let fixture: ComponentFixture<TestCaseExecutionResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestCaseExecutionResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestCaseExecutionResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
