export type EntityType = 'rock' | 'paper' | 'scissors';

export interface Vector2 {
  x: number;
  y: number;
}

export interface GameConfig {
  initialRock: number;
  initialPaper: number;
  initialScissors: number;
}

export interface GameStats {
  rock: number;
  paper: number;
  scissors: number;
  winner: EntityType | null;
}
