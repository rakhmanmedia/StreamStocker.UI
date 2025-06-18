import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ElementRef, Inject, Injectable } from '@angular/core';
import { STOCKER_API_URL } from '../../app-injection-tokens';
import { catchError, Observable, Subject, throwError } from 'rxjs';
import { UploadFilesResult } from '../../models/uploadFilesResult';
import { IBaseResponse } from '../../models/baseResponse';
import { Docs } from '../../models/document';
import { Guid } from 'guid-typescript';
import { AttachmentType } from '../../models/attachment-type.enum';
import { error } from 'jquery';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  private sessionContainerIdSubject = new Subject<string>();
  selectedSessionContainerId$ = this.sessionContainerIdSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(STOCKER_API_URL) private stokerApi: string
  ) { }

  initializeAddAttacmentButtonListener(datatableRef: ElementRef): void {
    datatableRef.nativeElement.addEventListener('click', (event: Event) => {
      const target = event.target as HTMLElement;
      const button = target.closest('button[data-session-container-id]') as HTMLButtonElement;

      if (button) {
        event.preventDefault();
        const id = button.getAttribute('data-session-container-id');
        
        if (id) this.sessionContainerIdSubject.next(id);
      }
    })
  }

  initializeLinkCountAttachemntsListener(datatableRef: ElementRef): void {
    datatableRef.nativeElement.addEventListener('click', (event: Event) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a[data-session-container-id]');

      if (link) {
        const id = link.getAttribute('data-session-container-id');
        
        if (id) this.sessionContainerIdSubject.next(id);
      }
    });
  }

  // Открыть окно выбора файлов
  openFileInput(typeAttachments: AttachmentType, selectedSessionContainerId: string): void {
    const elementId = typeAttachments == AttachmentType.Image
      ? `image-input-${selectedSessionContainerId}`
      : `document-input-${selectedSessionContainerId}`

    document.getElementById(elementId)?.click();
  }
  //

  // Получение списка загружаемых вложений
  getSelectedFiles(event: Event): FileList | null {
    const target = event.target as HTMLInputElement;
    return target.files.length > 0 ? target.files : null;
  }
  //

  uploadFiles1(
    sessionContainerId: string,
    typeAttachments: AttachmentType,
    guideStatusDocumentId: string,
    files: FileList,
    onSuccess: (res: any) => void,
    onError: (err: any) => void,
    onComplete?: () => void
  ): void {
    if (!files || files.length == 0) {
      onError({ error: 'Не выбрано ни одного файла.' }); 
      return;
    }

    const formData = new FormData();

    Array.from(files).forEach(file => {formData.append('files', file)});
    
    formData.append('sessionContainerId', sessionContainerId);
    formData.append('typeAttachments', typeAttachments);
    formData.append('guideStatusDocumentId', guideStatusDocumentId);

    this.http.post<IBaseResponse<UploadFilesResult>>(`${this.stokerApi}/api/document/upload-documents`, formData)
    .subscribe({
      next: onSuccess,
      error: onError,
      complete: onComplete
    })
  }

  uploadFiles(formData: FormData): Observable<IBaseResponse<UploadFilesResult>> {
    return this.http.post<IBaseResponse<UploadFilesResult>>(`${this.stokerApi}/api/document/upload-documents`, formData)
    .pipe(catchError(err => {throw err}));
  }

  updateDocumentProperties(document: Docs): Observable<IBaseResponse<boolean>> {
    console.log(document);
    
    return this.http.put<IBaseResponse<boolean>>(`${this.stokerApi}/api/document/update-document-properties`, document)
    .pipe(catchError(err => {throw err}));
  }

  getFilesForSessionContainer(sessionContainerId: string): Observable<IBaseResponse<Docs[]>> {
    const params = { sessionContainerId: sessionContainerId.toString() } 
    
    return this.http.get<IBaseResponse<Docs[]>>(`${this.stokerApi}/api/document/get-documents-for-session-container`, {params})
    .pipe(catchError(err => {throw err}));
  }

  getFilesForContainer(containerId: string): Observable<IBaseResponse<Docs[]>> {
    const params = { containerId: containerId.toString() } 
    
    return this.http.get<IBaseResponse<Docs[]>>(`${this.stokerApi}/api/document/get-documents-for-container`, {params})
    .pipe(catchError(err => {throw err}));
  }

  getFileUrl(fileName: string, filePath: string): Observable<{ url: string }> {
    const params = {fileName: fileName, filePath: filePath};
    
    return this.http.get<{ url: string }>(`${this.stokerApi}/api/document/get-file-url`, {params})
    .pipe(catchError(err => {throw err}));
  }

  downloadArchive(attachments: Docs[]): Observable<Blob> {
    if (!attachments || attachments.length == 0)
      return throwError(() => new Error("Нет файлов для скачивания."));
    
    return this.http.post(`${this.stokerApi}/api/document/download-file-archive`, attachments, {headers: new HttpHeaders({ "Content-Type": "application/json" }),responseType: 'blob'})
    .pipe(catchError(err => {throw err}));
  }

  getCountAttachmentsForSessionContainer(sessionContainerId: string): Observable<IBaseResponse<number>> {
    const params = {sessionContainerId: sessionContainerId}
    return this.http.get<IBaseResponse<number>>(`${this.stokerApi}/api/document/get-count-documents-for-session-container`, {params})
    .pipe(catchError(err => {throw err}))
  }

  removeDocument(documentId: Guid): Observable<IBaseResponse<boolean>> {
    const params = {documentId: documentId.toString()};

    return this.http.delete<IBaseResponse<boolean>>(`${this.stokerApi}/api/document/remove-document`, {params})
    .pipe(catchError(err => {throw err}));
  }
}
