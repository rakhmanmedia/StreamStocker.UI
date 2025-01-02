import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { STOCKER_API_URL } from '../../app-injection-tokens';
import { IBaseResponse } from '../../models/baseResponse';
import { catchError, Observable } from 'rxjs';
import { StatusImportContainer } from '../../models/status-import-container.enum';
import { Container } from '../../models/container';

@Injectable({
  providedIn: 'root'
})
export class ContainerService {

  constructor(private http: HttpClient,
    @Inject(STOCKER_API_URL) private stokerApi: string
  ) { }

  checkContainer(container: Container): Observable<IBaseResponse<StatusImportContainer>> {
    return this.http.post<IBaseResponse<StatusImportContainer>>(`${this.stokerApi}/api/container/check-container`, container).pipe(catchError(err => { throw err }));
  }
}
