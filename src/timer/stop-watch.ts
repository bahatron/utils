import { ObjectBag } from "../types";

/**
 * @todo add start, stop and reset methods
 */
export function StopWatch() {
    let _start = new Date().valueOf();
    let _laps: [string, number][] = [];

    return {
        elapsed() {
            return new Date().valueOf() - _start;
        },

        addLap(name: string) {
            _laps.push([name, new Date().valueOf()]);
        },

        getLaps(): ObjectBag<number> {
            return _laps.reduce(
                (result, [key, point], index) => {
                    if (index === 0) {
                        result[key] = point - _start;
                    } else {
                        result[key] = point - _laps[index - 1][1];
                    }

                    return result;
                },
                { start: 0 } as ObjectBag<number>
            );
        },
    };
}
