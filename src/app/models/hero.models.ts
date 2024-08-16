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
    allies!: Character[];

    constructor(index: number, messageService: MessageService, gameStateService: GameStateService, attackPower: number, defense: number, evasion: number, name: string, imageUrl: string) {
        super(index, messageService, gameStateService, attackPower, defense, evasion, name, imageUrl)
        this.abilityName = 'Fortify';
        this.gameStateService.heroes.subscribe(heroes => {
            this.allies = heroes;
        })
        this.ability = () => {
            this.allies.forEach(ally => {
                ally.defense += 15;
                if (ally.defense >= 100) {
                    ally.defense = 95
                }
            });
            this.gameStateService.heroes.next(this.allies);
            this.sendMessage(`${this.name} fortifies all allies, raising their defense!`)
        }
    }
}

export class Ranger extends Hero {
    abilityName: string;
    ability: Function;

    constructor(index: number, messageService: MessageService, gameStateService: GameStateService, attackPower: number, defense: number, evasion: number, name: string, imageUrl: string) {
        super(index, messageService, gameStateService, attackPower, defense, evasion, name, imageUrl)
        this.abilityName = 'Pierce';
        this.ability = (enemy: Character) => {
            enemy.defense = 0;
            this.sendMessage(`${this.name} pierced ${enemy.name}, removing his defenses!`)
        }
    }
}

export class BlackMage extends Hero {
    abilityName: string;
    ability: Function;

    constructor(index: number, messageService: MessageService, gameStateService: GameStateService, attackPower: number, defense: number, evasion: number, name: string, imageUrl: string) {
        super(index, messageService, gameStateService, attackPower, defense, evasion, name, imageUrl)
        this.abilityName = 'Firestorm';
        this.ability = () => {
            let findEnemy = () => {
                if (this.enemies.every(element => element === undefined)) {
                    return null
                };
                let enemyIndex = Math.floor(Math.random()*4);
                if (this.enemies[enemyIndex]) {
                    return this.enemies[enemyIndex]
                } else {
                    return findEnemy()
                };
            }
            let blastEnemy = () => {
                const target = findEnemy();
                if (target) {
                    target.health -= target.health - this.attackPower;
                    if (target.health < 0) {
                        this.killCharacter(target.index);
                    };
                    this.sendMessage(`${this.name} blasts ${target.name} for ${this.attackPower}!`);
                };
                this.gameStateService.enemies.next(this.enemies);
            };
            blastEnemy();
            let counter = 0;
            const intervalId = setInterval(() => {
                blastEnemy();
                counter++;
                if (counter >= 4) {
                    clearInterval(intervalId)
                }
            }, 100)
        }
    }
}

export class Shaman extends Hero {
    abilityName: string;
    ability: Function;
    allies!: Character[]

    constructor(index: number, messageService: MessageService, gameStateService: GameStateService, attackPower: number, defense: number, evasion: number, name: string, imageUrl: string) {
        super(index, messageService, gameStateService, attackPower, defense, evasion, name, imageUrl)
        this.gameStateService.heroes.subscribe(allies => {
            this.allies = allies
        });
        this.abilityName = 'Burning Soul';
        this.ability = () => {
            this.allies.forEach(ally => ally.attackPower += 15);
            this.gameStateService.heroes.next(this.allies);
            this.sendMessage(`${this.name} increases the attack power of all allies!`);
        }
    }
}

export class Ninja extends Hero {
    abilityName: string;
    ability: Function;

    constructor(index: number, messageService: MessageService, gameStateService: GameStateService, attackPower: number, defense: number, evasion: number, name: string, imageUrl: string) {
        super(index, messageService, gameStateService, attackPower, defense, evasion, name, imageUrl)
        this.abilityName = 'Deathstrike';
        this.ability = (target: Character) => {
            let roll = Math.floor(Math.random()*100);
            if (roll > 50) {
                this.killCharacter(target.index);
                this.sendMessage(`${this.name} kills ${target.name}!`)
            } else {
                this.sendMessage(`${this.name} strikes at ${target.name}, but misses!`)
            }
        }
    }
}

export class Spiritualist extends Hero {
    abilityName: string;
    ability: Function;
    allies!: Character[];

    constructor(index: number, messageService: MessageService, gameStateService: GameStateService, attackPower: number, defense: number, evasion: number, name: string, imageUrl: string) {
        super(index, messageService, gameStateService, attackPower, defense, evasion, name, imageUrl)
        this.gameStateService.heroes.subscribe(allies => {
            this.allies = allies
        });
        this.abilityName = 'Reflective Soul';
        this.ability = () => {
            this.allies.forEach(ally => {
                if (!ally.statusEffects.includes('Reflect')) {
                    ally.statusEffects.push('Reflect');
                };
            });
            this.gameStateService.heroes.next(this.allies);
            this.sendMessage(`${this.name} gives all allies a reflective soul!`)
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