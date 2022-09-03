import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GenerateReportsComponent } from './generate-reports.component';

describe('GenerateReportsComponent', () => {
  let component: GenerateReportsComponent;
  let fixture: ComponentFixture<GenerateReportsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GenerateReportsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerateReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
