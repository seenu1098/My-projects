import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageRenderDialogComponent } from './image-render-dialog.component';

describe('ImageRenderDialogComponent', () => {
  let component: ImageRenderDialogComponent;
  let fixture: ComponentFixture<ImageRenderDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImageRenderDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageRenderDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
