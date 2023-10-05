const DEV_MODE = process.env.NODE_ENV !== "production";
const QUEUE_WORKERS = Number(process.env.QUEUE_WORKERS);

const LOG_CONFIG = {
    out_file: "/dev/null",
    error_file: "/dev/null",
};

module.exports = {
    apps: [],
};
