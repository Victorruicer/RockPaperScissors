import { Entity } from './Entity';
import type { GameConfig, GameStats, EntityType } from './types';

export class Simulation {
    entities: Entity[] = [];
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    isRunning: boolean = false;
    animationId: number | null = null;
    lastTime: number = 0;
    onStatsUpdate: (stats: GameStats) => void;
    onGameOver: (winner: EntityType) => void;

    constructor(
        canvas: HTMLCanvasElement,
        onStatsUpdate: (stats: GameStats) => void,
        onGameOver: (winner: EntityType) => void
    ) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        this.onStatsUpdate = onStatsUpdate;
        this.onGameOver = onGameOver;

        // Initial stats update
        this.updateStats();

        // Resize listener
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        if (this.canvas.parentElement) {
            const isMobile = window.innerWidth <= 768;
            const ratio = isMobile ? 0.95 : 0.7; // Use 95% on mobile, 70% on desktop

            this.canvas.width = this.canvas.parentElement.clientWidth * ratio;
            this.canvas.height = this.canvas.parentElement.clientHeight * ratio;
        } else {
            this.canvas.width = 800; // Fallback
            this.canvas.height = 600;
        }
    }

    init(config: GameConfig) {
        this.entities = [];
        this.spawnEntities('rock', config.initialRock);
        this.spawnEntities('paper', config.initialPaper);
        this.spawnEntities('scissors', config.initialScissors);
        this.updateStats();
    }

    private spawnEntities(type: EntityType, count: number) {
        for (let i = 0; i < count; i++) {
            const x = Math.random() * (this.canvas.width - 40) + 20;
            const y = Math.random() * (this.canvas.height - 40) + 20;
            this.entities.push(new Entity(x, y, type));
        }
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTime = performance.now();
        this.loop();
    }

    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    private loop() {
        if (!this.isRunning) return;

        const now = performance.now();
        const dt = (now - this.lastTime) / 1000;
        this.lastTime = now;

        this.update(dt);
        this.draw();

        this.animationId = requestAnimationFrame(() => this.loop());
    }

    private update(dt: number) {
        // Update positions
        for (const entity of this.entities) {
            entity.update(dt, this.canvas.width, this.canvas.height);
        }

        this.checkCollisions();
        this.checkWinCondition();
    }

    private checkCollisions() {
        for (let i = 0; i < this.entities.length; i++) {
            for (let j = i + 1; j < this.entities.length; j++) {
                const a = this.entities[i];
                const b = this.entities[j];

                const dx = b.position.x - a.position.x;
                const dy = b.position.y - a.position.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const minDist = a.radius + b.radius;

                if (dist < minDist) {
                    this.resolveCollision(a, b, dx, dy, dist, minDist);
                }
            }
        }
    }

    private resolveCollision(a: Entity, b: Entity, dx: number, dy: number, dist: number, minDist: number) {
        // 1. Resolve overlap
        const overlap = minDist - dist;
        const nx = dx / dist;
        const ny = dy / dist;

        // Move apart proportional to inverse mass (equal mass here)
        const moveX = nx * overlap * 0.5;
        const moveY = ny * overlap * 0.5;

        a.position.x -= moveX;
        a.position.y -= moveY;
        b.position.x += moveX;
        b.position.y += moveY;

        // 2. Elastic collision response (swap velocities along normal)
        // Simplified for equal mass: swap normal components
        const v1n = a.velocity.x * nx + a.velocity.y * ny;
        const v2n = b.velocity.x * nx + b.velocity.y * ny;

        // Tangent components
        const tx = -ny;
        const ty = nx;
        const v1t = a.velocity.x * tx + a.velocity.y * ty;
        const v2t = b.velocity.x * tx + b.velocity.y * ty;

        // Swap normal components
        const v1nFinal = v2n;
        const v2nFinal = v1n;

        // Convert back to x/y
        a.velocity.x = v1nFinal * nx + v1t * tx;
        a.velocity.y = v1nFinal * ny + v1t * ty;
        b.velocity.x = v2nFinal * nx + v2t * tx;
        b.velocity.y = v2nFinal * ny + v2t * ty;

        // 3. Game Logic: Transformation
        this.applyGameRules(a, b);
    }

    private applyGameRules(a: Entity, b: Entity) {
        if (a.type === b.type) return;

        let changed = false;

        if (a.type === 'rock' && b.type === 'scissors') {
            b.type = 'rock';
            changed = true;
        } else if (a.type === 'scissors' && b.type === 'paper') {
            b.type = 'scissors';
            changed = true;
        } else if (a.type === 'paper' && b.type === 'rock') {
            b.type = 'paper';
            changed = true;
        } else if (b.type === 'rock' && a.type === 'scissors') {
            a.type = 'rock';
            changed = true;
        } else if (b.type === 'scissors' && a.type === 'paper') {
            a.type = 'scissors';
            changed = true;
        } else if (b.type === 'paper' && a.type === 'rock') {
            a.type = 'paper';
            changed = true;
        }

        if (changed) {
            this.updateStats();
        }
    }

    private updateStats() {
        const stats: GameStats = {
            rock: 0,
            paper: 0,
            scissors: 0,
            winner: null
        };

        for (const entity of this.entities) {
            stats[entity.type]++;
        }

        this.onStatsUpdate(stats);
    }

    private checkWinCondition() {
        const counts = {
            rock: 0,
            paper: 0,
            scissors: 0
        };
        for (const entity of this.entities) {
            counts[entity.type]++;
        }

        const activeTypes = [counts.rock > 0, counts.paper > 0, counts.scissors > 0].filter(Boolean).length;

        if (activeTypes === 1) {
            let winner: EntityType | null = null;
            if (counts.rock > 0) winner = 'rock';
            else if (counts.paper > 0) winner = 'paper';
            else if (counts.scissors > 0) winner = 'scissors';

            if (winner) {
                this.stop();
                this.onGameOver(winner);
            }
        }
    }

    private draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (const entity of this.entities) {
            entity.draw(this.ctx);
        }
    }
}
