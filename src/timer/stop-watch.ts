export function StopWatch() {
    let _time = new Date().valueOf();
    let _laps: [string, number][] = [];

    return {
        elapsed() {
            return new Date().valueOf() - _time;
        },

        addLap(name: string) {
            _laps.push([name, new Date().valueOf()]);
        },

        getLaps(): Record<string, number> {
            return _laps.reduce((result, [key, point]) => {
                result[key] = point - _time;
                return result;
            }, {} as Record<string, number>);
        },
    };
}
