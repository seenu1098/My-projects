import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DragconfirmComponent } from './dragconfirm.component';

describe('DragconfirmComponent', () => {
  let component: DragconfirmComponent;
  let fixture: ComponentFixture<DragconfirmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DragconfirmComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DragconfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
