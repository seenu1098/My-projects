import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationConfigurationComponent } from './application-configuration.component';

describe('ApplicationConfigurationComponent', () => {
  let component: ApplicationConfigurationComponent;
  let fixture: ComponentFixture<ApplicationConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApplicationConfigurationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
