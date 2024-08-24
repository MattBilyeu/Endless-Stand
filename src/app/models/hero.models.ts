import { Injectable } from "@angular/core";
import { Character } from "./character.model";
import { MessageService } from "../services/message.service";
import { GameStateService } from "../services/game-state.service";

@Injectable({
    providedIn: 'root',
})

export class HeroFactory {
    constructor(private messageService: MessageService, private gameStateService: GameStateService) {}

    // Last three stats - attackPower, Defense, Evasion

    createPaladin(index: number) {
        return new Paladin(index, this.messageService, this.gameStateService, 50, 75, 10)
    }

    createWhiteMage(index: number) {
        return new WhiteMage(index, this.messageService, this.gameStateService, 15, 35, 10)
    }

    createWarrior(index: number) {
        return new Warrior(index, this.messageService, this.gameStateService, 75, 40, 10)
    }

    createKnight(index: number) {
        return new Knight(index, this.messageService, this.gameStateService, 60, 60, 10)
    }

    createRanger(index: number) {
        return new Ranger(index, this.messageService, this.gameStateService, 90, 15, 10)
    }

    createBlackMage(index: number) {
        return new BlackMage(index, this.messageService, this.gameStateService, 25, 35, 10)
    }

    createShaman(index: number) {
        return new Shaman(index, this.messageService, this.gameStateService, 50, 50, 30)
    }

    createNinja(index: number) {
        return new Ninja(index, this.messageService, this.gameStateService, 80, 0, 75)
    }

    createSpiritualist(index: number) {
        return new Spiritualist(index, this.messageService, this.gameStateService, 50, 35, 10)
    }

    createBrawler(index: number) {
        return new Brawler(index, this.messageService, this.gameStateService, 65, 50, 40)
    }

    createBard(index: number) {
        return new Bard(index, this.messageService, this.gameStateService, 5, 60, 75)
    }

    createMachinist(index: number) {
        return new Machinist(index, this.messageService, this.gameStateService, 60, 75, 10)
    }
}

export class Hero extends Character {
    constructor(index: number, messageService: MessageService, gameStateService: GameStateService, attackPower: number, defense: number, evasion: number) {
        super(index, messageService, gameStateService, attackPower, defense, evasion)
        this.gameStateService.enemies.subscribe(enemies => {
            this.enemies = enemies;
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
        };
        this.endTurn();
    }
}

export class Paladin extends Hero {
    abilityName: string;
    ability: Function;
    allies!: (Character | undefined)[];

    constructor(index: number, messageService: MessageService, gameStateService: GameStateService, attackPower: number, defense: number, evasion: number) {
        super(index, messageService, gameStateService, attackPower, defense, evasion)
        this.name = 'Paladin';
        this.imageUrl = '';
        this.abilityName = 'Bubble';
        this.gameStateService.heroes.subscribe(heroes => {
            this.allies = heroes;
        });
        this.ability = () => {
            this.allies.forEach(character => {
                if (character && !character.statusEffects.includes('bubble')) {
                    character.statusEffects.push('bubble');
                }
            });
            this.gameStateService.heroes.next(this.allies);
            this.sendMessage('Paladin casts Bubble on all allies!');
        };
        this.endTurn();
    }
}

export class WhiteMage extends Hero {
    abilityName: string;
    ability: Function;
    allies!: (Character | undefined)[];

    constructor(index: number, messageService: MessageService, gameStateService: GameStateService, attackPower: number, defense: number, evasion: number) {
        super(index, messageService, gameStateService, attackPower, defense, evasion)
        this.name = 'WhiteMage';
        this.imageUrl = '';
        this.abilityName = 'Heal';
        this.ability = () => {
            this.allies.forEach(character => {
                if (character) {
                    character.health = 100
                }
            });
            this.gameStateService.heroes.next(this.allies);
            this.sendMessage('White Mage heals all allies!');
        };
        this.endTurn();
    }
}

export class Warrior extends Hero {
    abilityName: string;
    ability: Function;

    constructor(index: number, messageService: MessageService, gameStateService: GameStateService, attackPower: number, defense: number, evasion: number) {
        super(index, messageService, gameStateService, attackPower, defense, evasion)
        this.name = 'Warrior';
        this.imageUrl = '';
        this.abilityName = 'Cleave';
        this.ability = () => {
            const killedEnemyNames: string[] = [];
            this.enemies.forEach(enemy => {
                if (enemy) {
                    const damage = Math.floor((this.attackPower/2)*(enemy.defense/100));
                    enemy.health -= damage;
                    if (enemy.health < 0) {
                        killedEnemyNames.push(enemy.name);
                        this.killCharacter(enemy.index);
                    }
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
        };
        this.endTurn();
    }
}

export class Knight extends Hero {
    abilityName: string;
    ability: Function;
    allies!: (Character | undefined)[];

    constructor(index: number, messageService: MessageService, gameStateService: GameStateService, attackPower: number, defense: number, evasion: number) {
        super(index, messageService, gameStateService, attackPower, defense, evasion)
        this.name = 'Knight';
        this.imageUrl = '';
        this.abilityName = 'Fortify';
        this.gameStateService.heroes.subscribe(heroes => {
            this.allies = heroes;
        })
        this.ability = () => {
            this.allies.forEach(ally => {
                if (ally) {
                    ally.defense += 15;
                    if (ally.defense >= 100) {
                        ally.defense = 95
                    }
                }
            });
            this.gameStateService.heroes.next(this.allies);
            this.sendMessage(`${this.name} fortifies all allies, raising their defense!`)
        };
        this.endTurn();
    }
}

export class Ranger extends Hero {
    abilityName: string;
    ability: Function;

    constructor(index: number, messageService: MessageService, gameStateService: GameStateService, attackPower: number, defense: number, evasion: number) {
        super(index, messageService, gameStateService, attackPower, defense, evasion)
        this.name = 'Ranger';
        this.imageUrl = '';
        this.abilityName = 'Pierce';
        this.ability = (enemy: Character) => {
            enemy.defense = 0;
            this.sendMessage(`${this.name} pierced ${enemy.name}, removing his defenses!`)
        };
        this.endTurn();
    }
}

export class BlackMage extends Hero {
    abilityName: string;
    ability: Function;

    constructor(index: number, messageService: MessageService, gameStateService: GameStateService, attackPower: number, defense: number, evasion: number) {
        super(index, messageService, gameStateService, attackPower, defense, evasion)
        this.name = 'BlackMage';
        this.imageUrl = '';
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
            };
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
        };
        this.endTurn();
    }
}

export class Shaman extends Hero {
    abilityName: string;
    ability: Function;
    allies!: (Character | undefined)[]

    constructor(index: number, messageService: MessageService, gameStateService: GameStateService, attackPower: number, defense: number, evasion: number) {
        super(index, messageService, gameStateService, attackPower, defense, evasion)
        this.name = 'Shaman';
        this.imageUrl = '';
        this.gameStateService.heroes.subscribe(allies => {
            this.allies = allies
        });
        this.abilityName = 'Burning Soul';
        this.ability = () => {
            this.allies.forEach(ally => {
                if (ally) {
                    ally.attackPower += 15
                }
            });
            this.gameStateService.heroes.next(this.allies);
            this.sendMessage(`${this.name} increases the attack power of all allies!`);
        };
        this.endTurn();
    }
}

export class Ninja extends Hero {
    abilityName: string;
    ability: Function;

    constructor(index: number, messageService: MessageService, gameStateService: GameStateService, attackPower: number, defense: number, evasion: number) {
        super(index, messageService, gameStateService, attackPower, defense, evasion)
        this.name = 'Ninja';
        this.imageUrl = '';
        this.abilityName = 'Deathstrike';
        this.ability = (target: Character) => {
            let roll = Math.floor(Math.random()*100);
            if (roll > 50) {
                this.killCharacter(target.index);
                this.sendMessage(`${this.name} kills ${target.name}!`)
            } else {
                this.sendMessage(`${this.name} strikes at ${target.name}, but misses!`)
            }
        };
        this.endTurn();
    }
}

export class Spiritualist extends Hero {
    abilityName: string;
    ability: Function;
    allies!: (Character | undefined)[];

    constructor(index: number, messageService: MessageService, gameStateService: GameStateService, attackPower: number, defense: number, evasion: number) {
        super(index, messageService, gameStateService, attackPower, defense, evasion)
        this.name = 'Spiritualist';
        this.imageUrl = '';
        this.gameStateService.heroes.subscribe(allies => {
            this.allies = allies
        });
        this.abilityName = 'Reflective Soul';
        this.ability = () => {
            this.allies.forEach(ally => {
                if (ally) {
                    if (!ally.statusEffects.includes('Reflect')) {
                        ally.statusEffects.push('Reflect');
                    };
                }
            });
            this.gameStateService.heroes.next(this.allies);
            this.sendMessage(`${this.name} gives all allies a reflective soul!`)
        };
        this.endTurn();
    }
}

export class Brawler extends Hero {
    abilityName: string;
    ability: Function;

    constructor(index: number, messageService: MessageService, gameStateService: GameStateService, attackPower: number, defense: number, evasion: number) {
        super(index, messageService, gameStateService, attackPower, defense, evasion)
        this.name = 'Brawler';
        this.imageUrl = '';
        this.abilityName = 'Combination';
        this.ability = (target: Character) => {
            let message = `${this.name} attemps a combo and `;
            let finished = false;
            let firstAttempt = true;
            while (!finished) {
                if (firstAttempt) {
                    let roll = Math.floor(Math.random()*100);
                    if (roll < 35) {
                        message = message + 'fails';
                        finished = true;
                    } else {
                        const damage = Math.floor(this.attackPower*(target.defense/100));
                        target.health -= damage;
                        message = message + `does ${damage} to ${target.name}`
                        firstAttempt = false;
                    }
                } else {
                    let roll = Math.floor(Math.random()*100);
                    if (roll < 35) {
                        finished = true;
                    } else {
                        const damage = Math.floor(this.attackPower*(target.defense/100));
                        target.health -= damage;
                        message = message + `, does ${damage} to ${target.name}`
                    }
                }
            };
            message = message + '!'
            if (target.health < 0) {
                this.killCharacter(target.index);
            };
            this.sendMessage(message);
        };
        this.endTurn();
    }
}

export class Bard extends Hero {
    abilityName: string;
    ability: Function;
    allies!: (Character | undefined)[];

    constructor(index: number, messageService: MessageService, gameStateService: GameStateService, attackPower: number, defense: number, evasion: number) {
        super(index, messageService, gameStateService, attackPower, defense, evasion)
        this.name = 'Bard';
        this.imageUrl = '';
        this.abilityName = 'Inspire';
        this.gameStateService.heroes.subscribe(allies => this.allies = allies);
        this.ability = () => {
            this.allies.forEach(ally => {
                if (ally) {
                    ally.attackPower += 15
                }
            });
            this.gameStateService.heroes.next(this.allies);
            this.sendMessage(`${this.name} sings an inspiring song, boosting ally power!`)
        };
        this.endTurn();
    }
}

export class Machinist extends Hero {
    abilityName: string;
    ability: Function;

    constructor(index: number, messageService: MessageService, gameStateService: GameStateService, attackPower: number, defense: number, evasion: number) {
        super(index, messageService, gameStateService, attackPower, defense, evasion)
        this.name = 'Machinist';
        this.imageUrl = '';
        this.abilityName = 'Construct';
        this.ability = () => {
            //Need access to character factory - construct new ally to replace a missing one
        };
        this.endTurn();
    }
}