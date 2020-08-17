// timing

import { loadingTimeElement } from '../core.js';
import { buildElement } from './parse.js';

class Timer {
    constructor(name) {
        this.name = name;

        this.elapsed = 0;
        this.started;
        this.ended;
    }

    start() {
        this.started = Date.now();
    }

    stop() {
        this.ended = Date.now();
        this.elapsed = this.ended - this.started;
    }

    get elapsedMilliseconds() {
        return this.elapsed;
    }

    get elapsedSeconds() {
        return this.elapsed / 1000;
    }

    static toMilliseconds(seconds) {
        return seconds * 1000;
    }

    static toSeconds(milliseconds) {
        return milliseconds / 1000;
    }
}


const addLoadIndicator = (type, duration) => {
    if (duration) {
        loadingTimeElement.appendChild(
            buildElement(
                `p`,
                {
                    className: `${
                        type == "Everything" ? "loading-indicator-success" : ""
                        }`,
                },
                `${type} loaded in ${duration}ms (${Timer.toSeconds(
                    duration
                )}s)`
            )
        );
    } else if (duration == 0) {
        loadingTimeElement.appendChild(
            buildElement(
                `p`,
                {
                    className: "loading-indicator-version",
                },
                `${type}`
            )
        );
    } else {
        loadingTimeElement.appendChild(
            buildElement(
                `p`,
                {
                    className: "loading-indicator-failure",
                },
                `Failed to load ${type}.`
            )
        );
    }
};

export { Timer, addLoadIndicator };