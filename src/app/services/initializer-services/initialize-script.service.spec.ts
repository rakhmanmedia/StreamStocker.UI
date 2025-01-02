import { TestBed } from '@angular/core/testing';

import { InitializeScriptService } from './initialize-script.service';

describe('InitializeScriptService', () => {
  let service: InitializeScriptService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InitializeScriptService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
