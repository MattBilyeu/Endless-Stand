import { Injectable } from "@angular/core";
import { Character } from "./character.model";
import { MessageService } from "../services/message.service";
import { GameStateService } from "../services/game-state.service";

@Injectable({
    providedIn: 'root',
})

export class HeroFactory {
    constructor(private messageService: MessageService, private gameStateService: GameStateService) {}
}

export class Hero extends Character {
    constructor(index: number, messageService: MessageService, gameStateService: GameStateService, attackPower: number, defense: number, evasion: number, name: string, imageUrl: string) {
        super(index, messageService, gameStateService, attackPower, defense, evasion, name, imageUrl)
        this.gameStateService.enemies.subscribe((enemies: Character[]) => {
            this.enemies = enemies;
        });
        this.killCharacter = (index: number) => {
            this.enemies = this.enemies.splice(index, 1);
            this.gameStateService.enemies.next(this.enemies);
        }
        this.sendMessage = (message: string) => {
            this.messageService.message.next(message);
            setTimeout(() => {
                this.messageService.message.next(undefined)
            }, this.messageService.messageDuration)
        }
        this.attack = (character: Character) => {
            // Check status effects?
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
        }
    }
}

export class Paladin extends Hero {
    abilityName: string;
    ability: Function;
    allies!: Character[];

    constructor(index: number, messageService: MessageService, gameStateService: GameStateService, attackPower: number, defense: number, evasion: number, name: string, imageUrl: string) {
        super(index, messageService, gameStateService, attackPower, defense, evasion, name, imageUrl)
        this.abilityName = 'Bubble';
        this.gameStateService.heroes.subscribe(heroes => {
            this.allies = heroes;
        })
        this.ability = () => {
            this.allies.forEach(character => {
                if (!character.statusEffects.includes('bubble')) {
                    character.statusEffects.push('bubble');
                }
            });
            this.gameStateService.heroes.next(this.allies);
            this.sendMessage('Paladin casts Bubble on all allies!');
        }
    }
}

export class WhiteMage extends Hero {
    abilityName: string;
    ability: Function;
    allies!: Character[];

    constructor(index: number, messageService: MessageService, gameStateService: GameStateService, attackPower: number, defense: number, evasion: number, name: string, imageUrl: string) {
        super(index, messageService, gameStateService, attackPower, defense, evasion, name, imageUrl)
        this.abilityName = 'Heal';
        this.ability = () => {
            this.allies.forEach(character => {
                character.health = 100
            });
            this.gameStateService.heroes.next(this.allies);
            this.sendMessage('White Mage heals all allies!');
        }
    }
}

export class Warrior extends Hero {
    abilityName: string;
    ability: Function;

    constructor(index: number, messageService: MessageService, gameStateService: GameStateService, attackPower: number, defense: number, evasion: number, name: string, imageUrl: string) {
        super(index, messageService, gameStateService, attackPower, defense, evasion, name, imageUrl)
        this.abilityName = 'Cleave';
        this.ability = () => {
            const killedEnemyNames: string[] = [];
            this.enemies.forEach(enemy => {
                const damage = Math.floor((this.attackPower/2)*(enemy.defense/100));
                enemy.health -= damage;
                if (enemy.health < 0) {
                    killedEnemyNames.push(enemy.name);
                    this.killCharacter(enemy.index);
                }
            });
            if (killedEnemyNames.length === 0) {
                this.sendMessage(`${this.name} cleaves all enemies for half his strength!`)
            } else {
                let message = `${this.name} cleaves all enemies for half his strength, and kills: `;
                for (let i = 0; i < killedEnemyNames.length; i++) {
                    message = message + killedEnemyNames[i];
                    if (i < killedEnemyNames.length - 1) {
                        message = message + ', '
                    }
                }
                this.sendMessage(message);
            }
            this.gameStateService.enemies.next(this.enemies);
        }
    }
}

export class Knight extends Hero {
    abilityName: string;
    ability: Function;

    constructor(index: number, messageService: MessageService, gameStateService: GameStateService, attackPower: number, defense: number, evasion: number, name: string, imageUrl: string) {
        super(index, messageService, gameStateService, attackPower, defense, evasion, name, imageUrl)
        this.abilityName = 'Knight';
        this.ability = () => {

        }
    }
}

export class Sample extends Hero {
    abilityName: string;
    ability: Function;

    constructor(index: number, messageService: MessageService, gameStateService: GameStateService, attackPower: number, defense: number, evasion: number, name: string, imageUrl: string) {
        super(index, messageService, gameStateService, attackPower, defense, evasion, name, imageUrl)
        this.abilityName = '';
        this.ability = () => {

        }
    }
}