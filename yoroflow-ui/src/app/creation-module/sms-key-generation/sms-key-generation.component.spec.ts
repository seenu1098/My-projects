import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmsKeyGenerationComponent } from './sms-key-generation.component';

describe('SmsKeyGenerationComponent', () => {
  let component: SmsKeyGenerationComponent;
  let fixture: ComponentFixture<SmsKeyGenerationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SmsKeyGenerationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SmsKeyGenerationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
