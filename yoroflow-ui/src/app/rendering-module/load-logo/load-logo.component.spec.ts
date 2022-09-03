import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LoadLogoComponent } from './load-logo.component';

describe('LoadLogoComponent', () => {
  let component: LoadLogoComponent;
  let fixture: ComponentFixture<LoadLogoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LoadLogoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadLogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
