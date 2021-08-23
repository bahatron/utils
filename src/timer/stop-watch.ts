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

        printLaps() {
            return _laps.map(([key, point]) => {
                return [key, point - _time];
            });
        },
    };
}
