import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintConfigurationPropertiesComponent } from './print-configuration-properties.component';

describe('PrintConfigurationPropertiesComponent', () => {
  let component: PrintConfigurationPropertiesComponent;
  let fixture: ComponentFixture<PrintConfigurationPropertiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrintConfigurationPropertiesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintConfigurationPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
