import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { STOCKER_API_URL } from '../../app-injection-tokens';
import { catchError, Observable } from 'rxjs';
import { IBaseResponse } from '../../models/baseResponse';
import { TypeDocument } from '../../models/type-document';

@Injectable({
  providedIn: 'root'
})
export class TypeDocumentService {

  constructor(private http: HttpClient,
    @Inject(STOCKER_API_URL) private stockerApi: string
  ) { }

  getAllTypeDocuments() : Observable<IBaseResponse<TypeDocument[]>> {
    return this.http.get<IBaseResponse<TypeDocument[]>>(`${this.stockerApi}/api/typedocument/get-all-type-documents`)
    .pipe(catchError(err => {throw err}));
  }
}
