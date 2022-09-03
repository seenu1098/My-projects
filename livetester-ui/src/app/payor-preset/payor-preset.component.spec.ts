import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaPresetComponent } from './payor-preset.component';

describe('PaPresetComponent', () => {
  let component: PaPresetComponent;
  let fixture: ComponentFixture<PaPresetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaPresetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaPresetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
