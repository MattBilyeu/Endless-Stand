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

const findTarget = (array: (Character | undefined)[]) => {
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
        let difficulty = this.gameStateService.difficulty;
        this.attackPower = this.attackPower*difficulty;
        this.defense = this.defense*difficulty;
        if (this.defense > 95) {
            this.defense = 95;
        };
        this.evasion = this.evasion*difficulty;
        if (this.evasion > 75) {
            this.evasion = 75;
        };
        this.gameStateService.heroes.subscribe(heroes => {
            this.enemies = heroes;
        });
        this.killCharacter = (index: number) => {
            this.enemies[index] = undefined;
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
            };
            this.gameStateService.enemies.next(this.enemies);
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

export class Goblin extends Enemy {
    abilityName: string;
    ability: Function;

    constructor(index: number, messageService: MessageService, gameStateService: GameStateService, attackPower: number, defense: number, evasion: number) {
        super(index, messageService, gameStateService, attackPower, defense, evasion)
        this.name = 'Goblin';
        this.imageUrl = '';
        this.abilityName = 'Hamstring';
        this.ability = () => {
            let target = findTarget(this.enemies);
            if (target) {
                target.evasion = 0;
                this.sendMessage(`Goblin hamstrings ${target.name}, reducing evasion to 0!`);
                this.gameStateService.heroes.next(this.enemies);
            };
        };
        this.endTurn();
    }
} 

export class Warg extends Enemy {
    abilityName: string;
    ability: Function;

    constructor(index: number, messageService: MessageService, gameStateService: GameStateService, attackPower: number, defense: number, evasion: number) {
        super(index, messageService, gameStateService, attackPower, defense, evasion)
        this.name = 'Warg';
        this.imageUrl = '';
        this.abilityName = 'Lunge';
        this.ability = () => {
            let target = findTarget(this.enemies);
            if (target) {
                let miss = false;
                let attempt = Math.floor(Math.random()*75) - target.evasion;
                if (attempt < 50) {
                    this.sendMessage(`Warg lunges at ${target.name}, but misses!`)
                } else {
                    target.health = 1;
                    this.gameStateService.heroes.next(this.enemies);
                    this.sendMessage(`Warg lunges at ${target.name} and scores a lucky strike, reducing his health to 1!`)
                }
            };
        };
        this.endTurn();
    }
} 

export class Vampire extends Enemy {
    abilityName: string;
    ability: Function;
    allies!: (Character | undefined)[];

    constructor(index: number, messageService: MessageService, gameStateService: GameStateService, attackPower: number, defense: number, evasion: number) {
        super(index, messageService, gameStateService, attackPower, defense, evasion)
        this.gameStateService.enemies.subscribe(roster => this.allies = roster);
        this.name = 'Vampire';
        this.imageUrl = '';
        this.abilityName = 'Drain';
        this.ability = () => {
            let target = findTarget(this.enemies);
            if (target) {
                target.health -= 80;
                if (target.health < 0) {
                    this.killCharacter(target.index)
                };
                this.gameStateService.heroes.next(this.enemies);
                this.allies.forEach(ally => {
                    if (ally) {
                        ally.health += 20
                    }
                });
                this.gameStateService.enemies.next(this.allies);
                this.sendMessage(`Vampire drains 80 health from ${target.name}, healing allies for 20 each!`);
            }
        };
        this.endTurn();
    }
} 

export class Zombie extends Enemy {
    abilityName: string;
    ability: Function;

    constructor(index: number, messageService: MessageService, gameStateService: GameStateService, attackPower: number, defense: number, evasion: number) {
        super(index, messageService, gameStateService, attackPower, defense, evasion)
        this.name = 'Zombie';
        this.imageUrl = '';
        this.abilityName = 'Bite';
        this.ability = () => {
            let target = findTarget(this.enemies);
            let attempt = Math.floor(Math.random()*100);
            if (attempt > 95 && target) {
                this.killCharacter(target.index);
                this.sendMessage(`Zombie bites ${target.name}, and ${target.name} succumbs to zombification!`)
            } else if (target) {
                this.sendMessage(`Zombie bites at ${target.name}, but is too slow and misses!`)
            }
        };
        this.endTurn();
    }
} 

export class Skeleton extends Enemy {
    abilityName: string;
    ability: Function;

    constructor(index: number, messageService: MessageService, gameStateService: GameStateService, attackPower: number, defense: number, evasion: number) {
        super(index, messageService, gameStateService, attackPower, defense, evasion)
        this.name = 'Skeleton';
        this.imageUrl = '';
        this.abilityName = 'Heavy Strike';
        this.ability = () => {
            const character = findTarget(this.enemies);
            if (!character) {
                return this.endTurn();
            };
            if (Math.floor(Math.random()*100) < character.evasion) {
                this.sendMessage(`${this.name} performs a Heavy Strike at ${character.name}, but misses!`);
                return
            };
            const damage = Math.floor(this.attackPower);
            if (character.health < damage) {
                this.messageService.message.next(`${this.name} performs a heavy strike on ${character.name}, and kills him!`);
                this.killCharacter(character.index);
            } else {
                character.health -= damage;
                this.messageService.message.next(`${this.name} performs a Heavy Strike and does ${damage} damage to ${character.name}!`)
            };
            this.gameStateService.enemies.next(this.enemies);
        };
        this.endTurn();
    }
} 

export class Necromancer extends Enemy {
    abilityName: string;
    ability: Function;
    allies!: Character[];

    constructor(index: number, messageService: MessageService, gameStateService: GameStateService, attackPower: number, defense: number, evasion: number) {
        super(index, messageService, gameStateService, attackPower, defense, evasion)
        this.gameStateService.enemies.subscribe(allies => this.allies = allies);
        this.name = 'Necromancer';
        this.imageUrl = '';
        this.abilityName = 'Raise';
        this.ability = () => {
            
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