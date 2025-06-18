import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { STOCKER_API_URL } from '../../app-injection-tokens';
import { DriverRead } from '../../models/driver-read';
import { IBaseResponse } from '../../models/baseResponse';
import { catchError, Observable } from 'rxjs';
import { DriverCreate } from '../../models/driver-create';

@Injectable({
  providedIn: 'root'
})
export class DriverService {

  constructor(
      private http: HttpClient,
      @Inject(STOCKER_API_URL) private stokerApi: string
    ) { }
  
    searchDriver(term: string): Observable<IBaseResponse<DriverRead[]>> {
      const params = { searchingTerm: term }
      return this.http.get<IBaseResponse<DriverRead[]>>(`${this.stokerApi}/api/driver/search-driver`, { params })
      .pipe(catchError(err => {throw err}))
    }
  
    createDriver(transport: DriverCreate): Observable<IBaseResponse<DriverRead>> {
      return this.http.post<IBaseResponse<DriverRead>>(`${this.stokerApi}/api/driver/create-driver`, transport)
      .pipe(catchError(err => {throw err}))
    }
}
