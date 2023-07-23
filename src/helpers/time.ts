import moment from "moment";

export interface TimeOptions {
    units: moment.unitOfTime.Diff;
}
export async function time(
    handler: Function,
    options: TimeOptions = {
        units: "seconds",
    },
) {
    let start = moment();

    await handler();

    return moment().diff(start, options.units, true).toFixed(2);
}
