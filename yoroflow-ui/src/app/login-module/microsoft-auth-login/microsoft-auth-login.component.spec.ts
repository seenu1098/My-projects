import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MicrosoftAuthLoginComponent } from './microsoft-auth-login.component';

describe('MicrosoftAuthLoginComponent', () => {
  let component: MicrosoftAuthLoginComponent;
  let fixture: ComponentFixture<MicrosoftAuthLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MicrosoftAuthLoginComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MicrosoftAuthLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
