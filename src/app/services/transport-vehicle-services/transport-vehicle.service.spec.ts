import { TestBed } from '@angular/core/testing';

import { TransportVehicleService } from './transport-vehicle.service';

describe('TransportVehicleService', () => {
  let service: TransportVehicleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TransportVehicleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
