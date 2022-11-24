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

    it("can register a generic event listener", async () => {
        return new Promise<void>((resolve, reject) => {
            setTimeout(reject, 100);

            let obs = Observable({
                onEvent: (event, payload) => {
                    console.log(`on event triggered`, { event, payload });
                    resolve();
                },
            });

            obs.emit(`event`, { rick: "sanchez" });
        });
    });
});
