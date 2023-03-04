import { MODULE_NAME, TwitchCommand } from "./constants";
import { debug } from "./debug";
import { TwitchClient } from "./twitch-client/client";
import { TwitchMessage } from "./twitch-client/message-parser";

export class TwitchNotice {
    constructor(private readonly twitchClient: TwitchClient) {
        this.twitchClient.on(TwitchCommand.NOTICE, this.onNotice.bind(this));
    }

    private onNotice(message: TwitchMessage) {
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