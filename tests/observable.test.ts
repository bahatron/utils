import { Observable } from "../lib/observable";

describe("Observable", () => {
    it("can subscribe to events", () => {
        let obs = Observable();
        return new Promise<void>((resolve, reject) => {
            setTimeout(reject, 100);

            obs.on("event", (event) => {
                resolve();
            });

            obs.emit("event", "");
        });
    });
});
