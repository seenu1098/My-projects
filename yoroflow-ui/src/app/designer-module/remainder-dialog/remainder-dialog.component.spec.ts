import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemainderDialogComponent } from './remainder-dialog.component';

describe('RemainderDialogComponent', () => {
  let component: RemainderDialogComponent;
  let fixture: ComponentFixture<RemainderDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RemainderDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RemainderDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
