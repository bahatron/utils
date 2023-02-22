import { randomUUID } from "crypto";
import express from "express";
import { AsyncContext } from "../lib/context";
let app = express();

app.use((req, res, next) => {
    let uuid = randomUUID();
    AsyncContext.set("request_id", uuid);

    console.log(`created request id: ${uuid}`);

    return next();
});

app.use((req, res, next) => {
    let random = Math.random() < 0.5;

    if (random) {
        AsyncContext.set("user", { email: "test@email.com" });

        console.log(`added extra bit of data to async context`);
    } else {
        console.log(`no user added`);
    }

    return next();
});

app.use((req, res, next) => {
    let requestId = AsyncContext.get("request_id");
    let user = AsyncContext.get("user");

    console.log({ requestId, user });

    return next();
});

app.get("/", (req, res, next) => {
    res.send("hello");
});

app.listen(3000, () => console.log(`server running`));
