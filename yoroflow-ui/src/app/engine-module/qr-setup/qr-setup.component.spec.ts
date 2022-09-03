import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QrSetupComponent } from './qr-setup.component';

describe('QrSetupComponent', () => {
  let component: QrSetupComponent;
  let fixture: ComponentFixture<QrSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QrSetupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QrSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
