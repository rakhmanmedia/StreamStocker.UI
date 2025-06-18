import { TestBed } from '@angular/core/testing';

import { GuideStatusDocumnetService } from './guide-status-documnet.service';

describe('GuideStatusDocumnetService', () => {
  let service: GuideStatusDocumnetService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GuideStatusDocumnetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
