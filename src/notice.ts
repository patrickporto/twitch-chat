import { MODULE_NAME, TwitchCommand } from "./constants";
import { debug } from "./debug";
import { TwitchClient, TwitchConnectionEvent } from "./twitch-client/client";
import { TwitchMessage } from "./twitch-client/message-parser";

export class TwitchNotice {
    constructor(private readonly twitchClient: TwitchClient) {
        this.twitchClient.on(TwitchCommand.NOTICE, this.onNotice.bind(this));
        this.twitchClient.on(TwitchCommand.SUCCESSFULLY_LOGGED_IN, this.onLoginSuccessful.bind(this));
        this.twitchClient.on(TwitchCommand.JOIN, this.onJoin.bind(this));
        this.twitchClient.on(TwitchCommand.PART, this.onPart.bind(this));
        this.twitchClient.on(TwitchConnectionEvent.ERROR, this.onError.bind(this));
        this.twitchClient.on(TwitchConnectionEvent.CLOSE, this.onClose.bind(this));
        this.twitchClient.on(TwitchConnectionEvent.CONNECT, this.onConnect.bind(this));
    }

    private onConnect() {
        (ui as any).notifications.info(`${MODULE_NAME}: Connected to Twitch IRC.`);
    }

    private onError() {
        (ui as any).notifications.error(`${MODULE_NAME}: Error connecting to Twitch IRC.`);
    }

    private onClose() {
        (ui as any).notifications.warn(`${MODULE_NAME}: Connection to Twitch IRC closed.`);
    }

    private onLoginSuccessful() {
        (ui as any).notifications.info(`${MODULE_NAME}: Successfully logged in.`);
    }

    private onJoin() {
        (ui as any).notifications.info(`${MODULE_NAME}: Joined channel.`);
    }

    private onPart() {
        (ui as any).notifications.info(`${MODULE_NAME}: The channel must have banned (/ban) the bot.`);
    }

    private onNotice(message?: TwitchMessage) {
        if (!message) {
            throw new Error('Message is undefined');
        }
        if (message.parameters === 'Login authentication failed') {
            this.onLoginAuthFailed();
        } else if(message.parameters === 'You don’t have permission to perform that action') {
            this.onNoPermission();
        } else {
            this.onUnknownNotice(message);
        }
    }

    private onUnknownNotice(message: TwitchMessage) {
        (ui as any).notifications.error(`${MODULE_NAME}: ${message.parameters}`);
    }

    private onNoPermission() {
        (ui as any).notifications.error(`${MODULE_NAME}: You don't have permission to perform that action. Check if the access token is still valid.`);
    }

    private onLoginAuthFailed() {
        (ui as any).notifications.error(`${MODULE_NAME}: Login authentication failed. Please check your credentials.`);
    }
}
