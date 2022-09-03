import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MicrosoftAuthReturnComponent } from './microsoft-auth-return.component';

describe('MicrosoftAuthReturnComponent', () => {
  let component: MicrosoftAuthReturnComponent;
  let fixture: ComponentFixture<MicrosoftAuthReturnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MicrosoftAuthReturnComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MicrosoftAuthReturnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
