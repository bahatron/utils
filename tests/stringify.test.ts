import { stringify } from "../src/helpers";

describe.only("stringify", () => {
    it("does not scape stringified jsons", () => {
        let jsonString = `{"abc": 123}`;

        let result = stringify(jsonString);

        expect(JSON.parse(jsonString)).toEqual(JSON.parse(result));
    });
});
