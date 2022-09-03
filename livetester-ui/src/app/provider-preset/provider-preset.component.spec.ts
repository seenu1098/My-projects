import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderPresetComponent } from './provider-preset.component';

describe('ProviderPresetComponent', () => {
  let component: ProviderPresetComponent;
  let fixture: ComponentFixture<ProviderPresetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProviderPresetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProviderPresetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
