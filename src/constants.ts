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
    RECONNECT = 'RECONNECT',
}

export enum MessageStyle {
    USERNAME_AS_ALIAS = 'USERNAME_AS_ALIAS',
    USERNAME_AS_FLAVOR = 'USERNAME_AS_FLAVOR',
}

export enum TwitchChatEvent {
    SEND_MESSAGE = 'SEND_MESSAGE',
    MESSAGE_RECEIVED = 'MESSAGE_RECEIVED',
}
