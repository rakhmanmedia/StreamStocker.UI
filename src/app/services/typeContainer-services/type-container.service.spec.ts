import { TestBed } from '@angular/core/testing';

import { TypeContainerService } from './type-container.service';

describe('TypeContainerService', () => {
  let service: TypeContainerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TypeContainerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
