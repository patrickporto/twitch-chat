export const CANONICAL_NAME = "twitch-chat";
export const MODULE_NAME = "Twitch Chat";
export const MODULE_PATH = `/modules/${CANONICAL_NAME}`;

export enum TwitchCommand {
    PRIVATE_MESSAGE = 'PRIVMSG',
    PING = 'PING',
    SUCCESSFULLY_LOGGED_IN = '001',
    JOIN = 'JOIN',
    PART = 'PART',
    NOTICE = 'NOTICE',
}