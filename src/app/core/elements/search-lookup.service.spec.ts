import { TestBed } from '@angular/core/testing';

import { SearchLookupService } from './search-lookup.service';

describe('SearchLookupService', () => {
  let service: SearchLookupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SearchLookupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
