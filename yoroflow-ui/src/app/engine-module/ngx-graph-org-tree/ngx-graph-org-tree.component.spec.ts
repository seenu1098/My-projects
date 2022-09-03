import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NgxGraphOrgTreeComponent } from './ngx-graph-org-tree.component';

describe('NgxGraphOrgTreeComponent', () => {
  let component: NgxGraphOrgTreeComponent;
  let fixture: ComponentFixture<NgxGraphOrgTreeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NgxGraphOrgTreeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgxGraphOrgTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
