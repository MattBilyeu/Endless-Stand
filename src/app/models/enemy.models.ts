//Look for bubbles, reflect on attack
import { Injectable } from "@angular/core";
import { Character } from "./character.model";
import { MessageService } from "../services/message.service";
import { GameStateService } from "../services/game-state.service";

@Injectable({
    providedIn: 'root',
})
export class EnemyFactory {
    constructor(private gameStateService: GameStateService, private messageService: MessageService) {}

}

const findTarget = (array: Character[]) => {
    if (array.every(item => !item)) {
        return null
    };
    let character: Character | undefined = undefined;
    while (!character) {
        let index = Math.floor(Math.random()*(array.length));
        if (array[index]) {
            character = array[index]
        }
    }
    return character
}

export class Enemy extends Character {

    constructor(index: number, messageService: MessageService, gameStateService: GameStateService, attackPower: number, defense: number, evasion: number) {
        super(index, messageService, gameStateService, attackPower, defense, evasion)
        this.gameStateService.heroes.subscribe((heroes: Character[]) => {
            this.enemies = heroes;
        });
        this.killCharacter = (index: number) => {
            this.enemies = this.enemies.splice(index, 1);
            this.gameStateService.enemies.next(this.enemies);
        };
        this.sendMessage = (message: string) => {
            this.messageService.message.next(message);
            setTimeout(() => {
                this.messageService.message.next(undefined)
            }, this.messageService.messageDuration)
        }
        this.attack = () => {
            const character = findTarget(this.enemies);
            if (!character) {
                return this.endTurn();
            }
            if (Math.floor(Math.random()*100) < character.evasion) {
                this.sendMessage(`${this.name} swings at ${character.name}, but misses!`);
                return
            }
            const damage = Math.floor(this.attackPower*(character.defense/100));
            if (character.health < damage) {
                this.messageService.message.next(`${this.name} kills ${character.name}!`);
                this.killCharacter(character.index);
            } else {
                character.health -= damage;
                this.messageService.message.next(`${this.name} does ${damage} damage to ${character.name}!`)
            }
        };
        this.endTurn();
    }
}

export class Orc extends Enemy {
    abilityName: string;
    ability: Function;

    constructor(index: number, messageService: MessageService, gameStateService: GameStateService, attackPower: number, defense: number, evasion: number) {
        super(index, messageService, gameStateService, attackPower, defense, evasion)
        this.name = 'Orc';
        this.imageUrl = '';
        this.abilityName = 'Rampage';
        this.ability = () => {
            const roll = Math.floor(Math.random()*4);
            if (roll === 0) {
                this.sendMessage('Orc goes on a wild rampage, but in the wrong direction!');
                return this.endTurn();
            }
            let message = 'Orc goes on a wild rampage and deals 25 damage to: ';
            for (let i = 0; i < roll+1; i++) {
                let target = findTarget(this.enemies);
                if (i = 0 && target) {
                    message = message + target.name;
                    target.health -= 25;
                    if (target.health < 0) {
                        this.killCharacter(target.index);
                    }
                } else if (target) {
                    message = message + ', ' + target.name;
                    target.health -= 25;
                    if (target.health < 0) {
                        this.killCharacter(target.index);
                    }
                };
            };
            this.gameStateService.heroes.next(this.enemies);
        };
        this.endTurn();
    }
}

export class Master extends Enemy {
    abilityName: string;
    ability: Function;

    constructor(index: number, messageService: MessageService, gameStateService: GameStateService, attackPower: number, defense: number, evasion: number) {
        super(index, messageService, gameStateService, attackPower, defense, evasion)
        this.name = '';
        this.imageUrl = '';
        this.abilityName = '';
        this.ability = () => {

        };
        this.endTurn();
    }
} 