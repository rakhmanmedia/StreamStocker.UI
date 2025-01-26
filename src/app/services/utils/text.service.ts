import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TextService {

  constructor() { }

  // Получение правильного окончания при выборе файлов
  getFileWord(count: number): string {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
      return 'файлов';
    }

    if (lastDigit === 1) {
      return 'файл';
    }

    if (lastDigit >= 2 && lastDigit <= 4) {
      return 'файла';
    }

    return 'файлов';
  }

  getRecordWord(count: number): string {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
      return 'записей';
    }

    if (lastDigit === 1) {
      return 'запись';
    }

    if (lastDigit >= 2 && lastDigit <= 4) {
      return 'записи';
    }

    return 'файлов';
  }
}
