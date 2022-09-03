import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaEnvironmentPresetComponent } from './pa-environment-preset.component';

describe('PaEnvironmentPresetComponent', () => {
  let component: PaEnvironmentPresetComponent;
  let fixture: ComponentFixture<PaEnvironmentPresetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaEnvironmentPresetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaEnvironmentPresetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
