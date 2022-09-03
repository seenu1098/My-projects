import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PageGridConfigurationComponent } from './page-grid-configuration.component';

describe('PageGridConfigurationComponent', () => {
  let component: PageGridConfigurationComponent;
  let fixture: ComponentFixture<PageGridConfigurationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PageGridConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageGridConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
