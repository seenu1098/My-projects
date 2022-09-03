import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetricDataDetailsComponent } from './metric-data-details.component';

describe('MetricDataDetailsComponent', () => {
  let component: MetricDataDetailsComponent;
  let fixture: ComponentFixture<MetricDataDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MetricDataDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MetricDataDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
