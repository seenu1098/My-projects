import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MicrosoftRedirectComponent } from './microsoft-redirect.component';

describe('MicrosoftRedirectComponent', () => {
  let component: MicrosoftRedirectComponent;
  let fixture: ComponentFixture<MicrosoftRedirectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MicrosoftRedirectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MicrosoftRedirectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
