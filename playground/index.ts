import { ValidationFailed } from "../src/error";

async function main() {
    await new Promise((resolve) => {
        let error = ValidationFailed("hello", "poo");

        console.log(error);
        console.log("=".repeat(100));
        console.log(error.toString());
    });
}

main();
