import { TestBed } from '@angular/core/testing';

import { DatatableConfigService } from './datatable-config.service';

describe('DatatableConfigService', () => {
  let service: DatatableConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DatatableConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
