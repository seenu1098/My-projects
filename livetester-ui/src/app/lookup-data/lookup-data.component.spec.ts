import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LookupDataComponent } from './lookup-data.component';

describe('LookupDataComponent', () => {
  let component: LookupDataComponent;
  let fixture: ComponentFixture<LookupDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LookupDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LookupDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
