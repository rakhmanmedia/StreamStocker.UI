import { TestBed } from '@angular/core/testing';

import { EmptyContainerService } from './empty-container.service';

describe('EmptyContainerService', () => {
  let service: EmptyContainerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmptyContainerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
