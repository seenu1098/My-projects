import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BeneficiaryPresetComponent } from './beneficiary-preset.component';

describe('BeneficiaryPresetComponent', () => {
  let component: BeneficiaryPresetComponent;
  let fixture: ComponentFixture<BeneficiaryPresetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BeneficiaryPresetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BeneficiaryPresetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
