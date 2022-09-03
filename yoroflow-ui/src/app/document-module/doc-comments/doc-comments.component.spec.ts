import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocCommentsComponent } from './doc-comments.component';

describe('DocCommentsComponent', () => {
  let component: DocCommentsComponent;
  let fixture: ComponentFixture<DocCommentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DocCommentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocCommentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
