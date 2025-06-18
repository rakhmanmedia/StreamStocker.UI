import { Directive, forwardRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AbstractControl, AsyncValidator, NG_ASYNC_VALIDATORS, ValidationErrors } from '@angular/forms';
import { ContainerService } from '../services/container-services/container.service';
import { Observable, catchError, map, of, switchMap } from 'rxjs';
import { StatusImportContainer } from '../models/status-import-container.enum';
import { Container } from '../models/container';
import { ContainerCheckResponse } from '../models/container-check-response';

@Directive({
  selector: '[appContainerValidator]',
  providers: [
    {provide: NG_ASYNC_VALIDATORS, useExisting: forwardRef(() => ContainerValidatorDirective), multi: true}
  ]
})
export class ContainerValidatorDirective implements AsyncValidator, OnChanges {

  @Input() isValidatorActive: boolean = true;
  private control!: AbstractControl | null;

  constructor(private containerServ: ContainerService) {  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isValidatorActive']) {    
      if(this.control) {
        this.validate(this.control).subscribe(() => {this.control.updateValueAndValidity({onlySelf: true, emitEvent: true})})
      }
    }
  }
  
  validate(control: AbstractControl): Observable<ValidationErrors> | null {

    this.control = control;

    if (!this.isValidatorActive) 
      return of(null);

    const container = { number : control.value } as Container;

    return this.containerServ.checkContainer(container)
    .pipe(switchMap(resp => {
      if (resp.data.status == StatusImportContainer.MarkedForDeletion)
        return of({ markerdForDeletion: true, message: resp.data.description, sessionContainerId: resp.data.sessionContainerId })

      return of(this.mapValidationError(resp.data, resp.description));
    }),
    catchError((err) => of({'errorContainer': true, 'message': err.error.description})));
  }

  private mapValidationError(containerCheckResponse: ContainerCheckResponse, description: string): ValidationErrors {
    switch(containerCheckResponse.status) {
      case StatusImportContainer.InvalidControlDigit:
        return { invalidControlDigit : true, message: containerCheckResponse.description};
        case StatusImportContainer.InvalidFormat:
        return { invalidFormat : true, message: containerCheckResponse.description};
      case StatusImportContainer.AlreadyExist:
        return { alreadyExist: true, message: containerCheckResponse.description };
      case StatusImportContainer.Valid:
        return null;
      default:
        return { containerError: true, message: 'Неизвестная ошибка.' };
    }
  }
}
