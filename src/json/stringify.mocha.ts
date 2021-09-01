import { expect } from "chai";
import { stringify } from ".";

describe.only("stringify", () => {
    it("does not scape stringified jsons", () => {
        let jsonString = `{"abc": 123}`;

        let result = stringify(jsonString);

        expect(JSON.parse(jsonString)).to.deep.eq(JSON.parse(result));
    });
});
