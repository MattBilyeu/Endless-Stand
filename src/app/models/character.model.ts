import { Injectable } from "@angular/core";
import { MessageService } from "../services/message.service";
import { GameStateService } from "../services/game-state.service";

@Injectable({
    providedIn: 'root',
})

export class CharacterFactory {
    constructor(private messageService: MessageService, private gameStateService: GameStateService) {}
}

export class Character {
    name!: string;
    imageUrl!: string;
    health: number;
    attackPower: number;
    defense: number;
    evasion: number;
    index: number;
    statusEffects: string[];
    messageService: MessageService;
    gameStateService: GameStateService;
    enemies!: (Character | undefined)[];
    killCharacter!: Function;
    attack: Function;
    sendMessage: Function;
    endTurn: Function;

    constructor(index: number, messageService: MessageService, gameStateService: GameStateService, attackPower: number, defense: number, evasion: number) {
        this.health = 100;
        this.attackPower = attackPower;
        this.evasion = evasion;
        this.defense = defense;
        this.index = index;
        this.statusEffects = [];
        this.messageService = messageService;
        this.gameStateService = gameStateService;
        this.sendMessage = (message: string) => {
            this.messageService.message.next(message);
            setTimeout(() => {
                this.messageService.message.next(undefined)
            }, this.messageService.messageDuration)
        };
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
        this.endTurn = () => this.gameStateService.endTurn()
    }
}