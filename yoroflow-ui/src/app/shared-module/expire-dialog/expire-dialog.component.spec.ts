import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpireDialogComponent } from './expire-dialog.component';

describe('ExpireDialogComponent', () => {
  let component: ExpireDialogComponent;
  let fixture: ComponentFixture<ExpireDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExpireDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpireDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
