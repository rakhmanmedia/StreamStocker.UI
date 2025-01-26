import { TestBed } from '@angular/core/testing';

import { RedirectedContainerService } from './redirected-container.service';

describe('RedirectedContainerService', () => {
  let service: RedirectedContainerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RedirectedContainerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
