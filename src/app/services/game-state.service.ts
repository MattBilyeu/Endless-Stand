import { Injectable } from '@angular/core';
import { Character } from '../models/character.model';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameStateService {
  heroes = new BehaviorSubject<Character[]>([]);
  enemies = new BehaviorSubject<Character[]>([]);

  constructor() { }
}
