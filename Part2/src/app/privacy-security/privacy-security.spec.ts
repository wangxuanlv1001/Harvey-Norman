import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivacySecurity } from './privacy-security';

describe('PrivacySecurity', () => {
  let component: PrivacySecurity;
  let fixture: ComponentFixture<PrivacySecurity>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivacySecurity],
    }).compileComponents();

    fixture = TestBed.createComponent(PrivacySecurity);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
