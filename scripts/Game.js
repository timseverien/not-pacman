import AnimationLoop from './AnimationLoop.js';
import Mathf from './Mathf.js';

export default class Game {
    constructor(context, size) {
        this._context = context;
        this._size = size;

        this._padding = 4;
        this._columnCount = 1 + 16;
        this._cellSize = this._size / (this._columnCount + 2 * this._padding);

        this._playerDirection = 0;
        this._playerPosition = [0, 0];
        this._playerRadius = 0.5 * this._cellSize;
        this._score = 0;

        this._animationLoop = new AnimationLoop(frame => this._update(frame));

        this._addControls();
        this._resize();

        this._grid = Array.from({ length: this._columnCount * this._columnCount }, (_, index) => {
            const x = index % this._columnCount;
            const y = Math.floor(index / this._columnCount);

            return [x, y];
        });

        this._points = this._grid.filter(([x, y]) => {
            return x % 2 === 1 && y % 2 === 1;
        });
    }

    start() {
        this._animationLoop.start();
    }

    stop() {
        this._animationLoop.stop();
    }

    _addControls() {
        const playerDirectionKeyMapping = [
            'ArrowRight',
            'ArrowDown',
            'ArrowLeft',
            'ArrowUp',
        ];

        window.addEventListener('keydown', (event) => {
            if (event.key.startsWith('Arrow')) {
                this._playerDirection = playerDirectionKeyMapping.indexOf(event.key);
            }
        });
    }

    _update(frame) {
        const frameCount = 12;

        if (frame % frameCount > 0) {
            return;
        }

        this._playerPosition = Game._playerStepHandlers[this._playerDirection](this._playerPosition)
            .map(n => Math.max(0, Math.min(this._columnCount - 1, n)));
        
        for (const point of this._points) {
            if (!Game._isPlayerOnPoint(this._playerPosition, point)) {
                continue;
            }

            this._score++;
        }
        
        this._points = this._points.filter(point => !Game._isPlayerOnPoint(this._playerPosition, point));

        this._draw(frame / frameCount);

        if (this._points.length === 0) {
            alert('Je had iets cools verwacht hè? Jammer joh.');
        }
    }

    _gridToScreenSpace([x, y]) {
        const padding = this._padding * this._cellSize;
        const cellOffset = padding + 0.5 * this._cellSize;

        return [
            cellOffset + x * this._cellSize,
            cellOffset + y * this._cellSize,
        ];
    }

    _draw(frame) {
        this._drawBackground(frame);
        
        this._context.save();
        this._context.translate(0.5 * this._size, 0.5 * this._size);
        this._context.rotate(Math.PI / 4);
        this._context.translate(-0.5 * this._size, -0.5 * this._size);

        this._drawPlayer(frame);

        this._points.forEach(p => this._drawPoint(p));
        this._grid.forEach(p => this._drawGridPoint(p));

        this._context.restore();
    }

    _drawBackground() {
        this._context.fillStyle = Game._theme.background;
        this._context.fillRect(0, 0, this._size, this._size);
    }

    _drawGridPoint(point) {
        const [x, y] = this._gridToScreenSpace(point);

        this._context.fillStyle = Game._theme.grid;

        this._context.beginPath();
        this._context.arc(x, y, 2, 0, 2 * Math.PI);
        this._context.fill();
    }

    _drawPlayer(frame) {
        const [x, y] = this._gridToScreenSpace(this._playerPosition);
        const angle = this._playerDirection * Math.PI / 2;

        const mouthSize = Mathf.mix(0, Math.PI / 2, frame % 2);
        const mouthSizeHalf = 0.5 * mouthSize;

        this._context.fillStyle = Game._theme.player;

        this._context.save();
        this._context.beginPath();
        this._context.translate(x, y);
        this._context.rotate(angle);
        this._context.arc(0, 0, this._playerRadius, +mouthSizeHalf, 2 * Math.PI - mouthSizeHalf);
        this._context.lineTo(0, 0);
        this._context.fill();
        this._context.restore();
    }

    _drawPoint(point) {
        const [x, y] = this._gridToScreenSpace(point);

        const size = this._playerRadius;
        const sizeHalf = 0.5 * size;

        this._context.fillStyle = Game._theme.point;

        this._context.save();
        this._context.translate(x, y);
        this._context.rotate(Math.PI / 4);
        this._context.fillRect(-sizeHalf, -sizeHalf, size, size);
        this._context.restore();
    }

    _resize() {
        this._context.canvas.height = this._size;
        this._context.canvas.width = this._size;
    }

    static get _playerStepHandlers() {
        return [
            ([x, y]) => [x + 1, y],
            ([x, y]) => [x, y + 1],
            ([x, y]) => [x - 1, y],
            ([x, y]) => [x, y - 1],
        ];
    }

    static get _theme() {
        return {
            background: '#03343b',
            player: '#fbfbfb',
            point: '#fa9503',
            grid: 'rgb(251 251 251 / 0.125)',
        };
    }

    static _isPlayerOnPoint(player, point) {
        const [x, y] = point;
        const [px, py] = player;

        return x === px && y === py;
    }
}