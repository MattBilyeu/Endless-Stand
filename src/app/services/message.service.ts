import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  message = new Subject<string | undefined>();
  messageDuration: number = 500;

  constructor() { }
}
