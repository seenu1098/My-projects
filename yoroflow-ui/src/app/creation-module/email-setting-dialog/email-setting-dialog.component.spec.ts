import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailSettingDialogComponent } from './email-setting-dialog.component';

describe('EmailSettingDialogComponent', () => {
  let component: EmailSettingDialogComponent;
  let fixture: ComponentFixture<EmailSettingDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmailSettingDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailSettingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
