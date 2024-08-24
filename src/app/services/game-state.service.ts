import { Injectable } from '@angular/core';
import { Character } from '../models/character.model';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameStateService {
  heroes = new BehaviorSubject<(Character | undefined)[]>([]);
  enemies = new BehaviorSubject<(Character | undefined)[]>([]);
  difficulty: number = 1;

  constructor() { }

  endTurn() {
    
  }
}
