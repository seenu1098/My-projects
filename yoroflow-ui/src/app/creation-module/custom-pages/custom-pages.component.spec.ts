import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CustomPagesComponent } from './custom-pages.component';

describe('CustomPagesComponent', () => {
  let component: CustomPagesComponent;
  let fixture: ComponentFixture<CustomPagesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomPagesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomPagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
