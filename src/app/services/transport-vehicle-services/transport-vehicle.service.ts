import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { STOCKER_API_URL } from '../../app-injection-tokens';
import { catchError, Observable, pipe } from 'rxjs';
import { IBaseResponse } from '../../models/baseResponse';
import { TransportVehicleRead } from '../../models/transport-vehicle-read';
import { TransportVehicleCreate } from '../../models/transport-vehicle-create';

@Injectable({
  providedIn: 'root'
})
export class TransportVehicleService {

  constructor(
    private http: HttpClient,
    @Inject(STOCKER_API_URL) private stokerApi: string
  ) { }

  searchTransportVehicles(term: string): Observable<IBaseResponse<TransportVehicleRead[]>> {
    const params = { searchingTerm: term }
    return this.http.get<IBaseResponse<TransportVehicleRead[]>>(`${this.stokerApi}/api/transportvehicle/search-transport-number`, { params })
    .pipe(catchError(err => {throw err}))
  }

  createTransportVehicle(transport: TransportVehicleCreate): Observable<IBaseResponse<TransportVehicleRead>> {
    return this.http.post<IBaseResponse<TransportVehicleRead>>(`${this.stokerApi}/api/transportvehicle/create-transport-vehicle`, transport)
    .pipe(catchError(err => {throw err}))
  }
}
