import { Directive, forwardRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AbstractControl, AsyncValidator, NG_ASYNC_VALIDATORS, ValidationErrors } from '@angular/forms';
import { ContainerService } from '../services/container-services/container.service';
import { Observable, catchError, map, of } from 'rxjs';
import { StatusImportContainer } from '../models/status-import-container.enum';
import { Container } from '../models/container';

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
        this.validate(this.control).subscribe(() => {this.control.updateValueAndValidity({onlySelf: true, emitEvent: false})})
      }
    }
  }
  
  validate(control: AbstractControl): Observable<ValidationErrors> | null {

    this.control = control;

    if (!this.isValidatorActive) 
      return of(null);

    const container = { number : control.value } as Container;

    return this.containerServ.checkContainer(container).pipe(map((resp) => 
      {
        switch(resp.data){
          case StatusImportContainer.InvalidControlDigit:
            return { invalidControlDigit : true, message: resp.description};
            case StatusImportContainer.InvalidFormat:
            return { invalidFormat : true, message: resp.description};
          default:
            return { containerError: 'Неизвестный статус.' };
        }
      }), catchError((err) => of({'errorContainer': true, 'message': err.error.description})));

    // return this.containerServ.checkContainer(control.value).pipe(map((resp) => 
    //   (resp.data ? null : {'invalidContainer': true, 'message': resp.description})), 
    // catchError((err) => of({'errorContainer': true, 'message': err.error.description})));
  }
}
