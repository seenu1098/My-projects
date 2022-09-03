import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubStatusDialogComponent } from './sub-status-dialog.component';

describe('SubStatusDialogComponent', () => {
  let component: SubStatusDialogComponent;
  let fixture: ComponentFixture<SubStatusDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubStatusDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubStatusDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
