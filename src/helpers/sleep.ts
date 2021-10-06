export async function sleep(timer: number) {
    await new Promise((resolve) => setTimeout(resolve, timer));
}
