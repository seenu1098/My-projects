import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { YoroappsCreationComponent } from './creation.component';

describe('YoroappsCreationComponent', () => {
  let component: YoroappsCreationComponent;
  let fixture: ComponentFixture<YoroappsCreationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ YoroappsCreationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(YoroappsCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
