import { TestBed } from '@angular/core/testing';

import { MetronicService } from './metronic.service';

describe('MetronicService', () => {
  let service: MetronicService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MetronicService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
