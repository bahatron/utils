export enum LOGGER_LEVEL {
    DEBUG = "DEBUG",
    INFO = "INFO",
    WARNING = "WARNING",
    ERROR = "ERROR",
}

export const LOGGER_LEVEL_VALUE: Record<LOGGER_LEVEL, number> = {
    [LOGGER_LEVEL.DEBUG]: 0,
    [LOGGER_LEVEL.INFO]: 1,
    [LOGGER_LEVEL.WARNING]: 2,
    [LOGGER_LEVEL.ERROR]: 3,
};
