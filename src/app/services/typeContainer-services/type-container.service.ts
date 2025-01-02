import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { STOCKER_API_URL } from '../../app-injection-tokens';
import { catchError, Observable } from 'rxjs';
import { IBaseResponse } from '../../models/baseResponse';
import { TypeContainer } from '../../models/typeContainer';

@Injectable({
  providedIn: 'root'
})
export class TypeContainerService {

  constructor(private http: HttpClient,
    @Inject(STOCKER_API_URL) private stokerApi: string) { }

  getGetTypeContainers(): Observable<IBaseResponse<TypeContainer[]>> {
    return this.http.get<IBaseResponse<TypeContainer[]>>(`${this.stokerApi}/api/typecontainer/get-all-typecontainers`).pipe(catchError(err => { throw err }))
  }
}
