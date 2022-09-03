import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ApiKeyDialogBoxComponent } from './api-key-dialog-box.component';

describe('ApiKeyDialogBoxComponent', () => {
  let component: ApiKeyDialogBoxComponent;
  let fixture: ComponentFixture<ApiKeyDialogBoxComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ApiKeyDialogBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApiKeyDialogBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
