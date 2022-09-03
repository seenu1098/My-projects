import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ApplicationRightSheetComponent } from './application-right-sheet.component';

describe('ApplicationRightSheetComponent', () => {
  let component: ApplicationRightSheetComponent;
  let fixture: ComponentFixture<ApplicationRightSheetComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ApplicationRightSheetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationRightSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
