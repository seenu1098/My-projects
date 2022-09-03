import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpectedElementsConfigurationComponent } from './expected-elements-configuration.component';

describe('ExpectedElementsConfigurationComponent', () => {
  let component: ExpectedElementsConfigurationComponent;
  let fixture: ComponentFixture<ExpectedElementsConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExpectedElementsConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpectedElementsConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
