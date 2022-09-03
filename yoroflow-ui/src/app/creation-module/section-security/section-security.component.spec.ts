import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SectionSecurityComponent } from './section-security.component';

describe('SectionSecurityComponent', () => {
  let component: SectionSecurityComponent;
  let fixture: ComponentFixture<SectionSecurityComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SectionSecurityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SectionSecurityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
