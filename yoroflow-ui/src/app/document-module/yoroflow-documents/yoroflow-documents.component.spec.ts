import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YoroflowDocumentsComponent } from './yoroflow-documents.component';

describe('YoroflowDocumentsComponent', () => {
  let component: YoroflowDocumentsComponent;
  let fixture: ComponentFixture<YoroflowDocumentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ YoroflowDocumentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(YoroflowDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
