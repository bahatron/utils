import moment from "moment";

export async function time(
    handler: Function,
    options: { units: moment.unitOfTime.Diff },
) {
    let start = moment();

    await handler();

    return moment().diff(start, options.units, true).toFixed(2);
}
