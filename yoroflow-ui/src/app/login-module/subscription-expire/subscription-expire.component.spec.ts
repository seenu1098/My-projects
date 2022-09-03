import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionExpireComponent } from './subscription-expire.component';

describe('SubscriptionExpireComponent', () => {
  let component: SubscriptionExpireComponent;
  let fixture: ComponentFixture<SubscriptionExpireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubscriptionExpireComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscriptionExpireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
