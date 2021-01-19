export default class AnimationLoop {
    constructor(callback) {
        this._callback = callback;
        
        this._animationFrameHandle = null;
        this._frame = 0;

        this._onTick = () => {
            if (!this._animationFrameHandle) return;

            this._frame++;

            this._animationFrameHandle = requestAnimationFrame(this._onTick);
            this._callback(this._frame);
        };
    }

    start() {
        this._frame = 0;
        this._animationFrameHandle = requestAnimationFrame(this._onTick);
    }

    stop() {
        cancelAnimationFrame(this._animationFrameHandle);
        this._animationFrameHandle = null;
    }
}