import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AppLayoutPageListComponent } from './app-layout-page-list.component';

describe('AppLayoutPageListComponent', () => {
  let component: AppLayoutPageListComponent;
  let fixture: ComponentFixture<AppLayoutPageListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AppLayoutPageListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppLayoutPageListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
