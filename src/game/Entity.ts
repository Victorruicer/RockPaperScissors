import type { EntityType, Vector2 } from './types';

export class Entity {
    position: Vector2;
    velocity: Vector2;
    type: EntityType;
    radius: number = 19;
    mass: number = 1;

    constructor(x: number, y: number, type: EntityType) {
        this.position = { x, y };
        this.type = type;

        // Increased speed
        const speed = 60;
        const angle = Math.random() * Math.PI * 2;
        this.velocity = {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed
        };
    }

    update(dt: number, width: number, height: number) {
        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;

        // Wall collisions
        if (this.position.x - this.radius < 0) {
            this.position.x = this.radius;
            this.velocity.x *= -1;
        } else if (this.position.x + this.radius > width) {
            this.position.x = width - this.radius;
            this.velocity.x *= -1;
        }

        if (this.position.y - this.radius < 0) {
            this.position.y = this.radius;
            this.velocity.y *= -1;
        } else if (this.position.y + this.radius > height) {
            this.position.y = height - this.radius;
            this.velocity.y *= -1;
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.font = '40px "Press Start 2P", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Apply filter for rock to make it darker
        if (this.type === 'rock') {
            ctx.filter = 'brightness(0.5) contrast(1.2)';
        }

        ctx.fillText(this.getEmoji(), this.position.x, this.position.y);

        // Reset filter
        if (this.type === 'rock') {
            ctx.filter = 'none';
        }
    }

    private getEmoji(): string {
        switch (this.type) {
            case 'rock': return '🪨';
            case 'paper': return '📄';
            case 'scissors': return '✂️';
        }
    }
}
