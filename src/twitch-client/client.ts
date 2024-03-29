import { TwitchCommand } from "../constants";
import { debug } from "../debug";
import { parseMessage, TwitchMessage } from "./message-parser";


export enum TwitchConnectionEvent {
    ERROR = "ERROR",
    CONNECT = "CONNECT",
    CONNECTING = "CONNECTING",
    CLOSE = "CLOSE",
}

export type TwitchEvent = TwitchCommand | TwitchConnectionEvent;

type TwitchCommandCallback = (message?: TwitchMessage) => void;

export class TwitchClient {
    private client: WebSocket | null = null;
    private events: Record<TwitchEvent, TwitchCommandCallback[]> = {
        [TwitchCommand.PRIVATE_MESSAGE]: [],
        [TwitchCommand.PING]: [],
        [TwitchCommand.SUCCESSFULLY_LOGGED_IN]: [],
        [TwitchCommand.JOIN]: [],
        [TwitchCommand.PART]: [],
        [TwitchCommand.NOTICE]: [],
        [TwitchCommand.RECONNECT]: [],
        [TwitchConnectionEvent.ERROR]: [],
        [TwitchConnectionEvent.CONNECT]: [],
        [TwitchConnectionEvent.CLOSE]: [],
        [TwitchConnectionEvent.CONNECTING]: [],
    };

    constructor(
        private readonly channel: string,
        private readonly account: string,
        private readonly oauth: string
    ) {}

    private get ircURL() {
        if (location.protocol !== "https:") {
            return `ws://irc-ws.chat.twitch.tv:80`;
        }
        return `wss://irc-ws.chat.twitch.tv:443`;
    }

    connect() {
        debug("Connecting to Twitch IRC");
        this.emit(TwitchConnectionEvent.CONNECTING);
        this.client = new WebSocket(this.ircURL);
        this.client.addEventListener("open", this.onConnect.bind(this));
        this.client.addEventListener("close", this.onClose.bind(this));
        this.client.addEventListener("error", this.onError.bind(this));
        this.client.addEventListener("message", this.onMessage.bind(this));
    }

    on(command: TwitchEvent, callback: TwitchCommandCallback) {
        this.events[command].push(callback);
    }

    emit(command: TwitchEvent, message?: TwitchMessage) {
        for (const callback of this.events[command]) {
            callback(message);
        }
    }

    private onError(error: any) {
        debug("Connection Error: ", error.toString());
        this.emit(TwitchConnectionEvent.ERROR, error);
    }

    private onClose() {
        debug("Connection closed");
        this.client = null;
        this.emit(TwitchConnectionEvent.CLOSE);
        setTimeout(() => {
            this.connect();
        }, 1000);
    }

    private onConnect() {
        if (!this.client) {
            return;
        }
        debug("Connected to Twitch IRC");
        this.emit(TwitchConnectionEvent.CONNECT);
        this.client.send(`PASS ${this.oauth.trim()}`);
        this.client.send(`NICK ${this.account.toLocaleLowerCase().trim()}`);
    }

    private onMessage({ data: ircMessage }: MessageEvent) {
        debug("Received message from Twitch IRC", ircMessage);
        const messages = ircMessage
            .split("\r\n")
            .map(parseMessage)
            .filter(Boolean) as TwitchMessage[];
        debug("Parsed messages", messages);
        for (const message of messages) {
            if (message.command?.command === TwitchCommand.PING) {
                this.onPing(message);
            } else if (
                message.command?.command === TwitchCommand.PRIVATE_MESSAGE
            ) {
                this.onPrivateMessage(message);
            } else if (
                message.command?.command ===
                TwitchCommand.SUCCESSFULLY_LOGGED_IN
            ) {
                this.onSuccessfullyLoggedIn(message);
            } else if (message.command?.command === TwitchCommand.JOIN) {
                this.onJoin(message);
            } else if (message.command?.command === TwitchCommand.PART) {
                this.onPart(message);
            } else if (message.command?.command === TwitchCommand.NOTICE) {
                this.onNotice(message);
            } else if (message.command?.command === TwitchCommand.RECONNECT) {
                this.onReconnect(message);
            } else {
                debug("Unknown message", message);
            }
        }
    }

    private onPrivateMessage(message: TwitchMessage) {
        debug("Received private message from Twitch IRC", message);
        this.emit(TwitchCommand.PRIVATE_MESSAGE, message);
    }

    private onNotice(message: TwitchMessage) {
        debug("Received notice from Twitch IRC", message);
        this.emit(TwitchCommand.NOTICE, message);
        this.client?.send(`PART #${this.channel}`);
    }

    private onPart(message: TwitchMessage) {
        this.emit(TwitchCommand.PART, message);
        debug("The channel must have banned (/ban) the bot.");
        this.client?.close();
    }

    private onSuccessfullyLoggedIn(message: TwitchMessage) {
        if (!this.client) {
            return;
        }
        debug("Successfully logged in to Twitch IRC");
        this.emit(TwitchCommand.SUCCESSFULLY_LOGGED_IN, message);
        this.join();
    }
    private onJoin(message: TwitchMessage) {
        if (!this.client) {
            return;
        }
        debug("Joined channel");
        this.emit(TwitchCommand.JOIN, message);
        // this.sendPrivateMessage("Hello, world!");
    }

    private onPing(message: TwitchMessage) {
        debug("Received PING from Twitch IRC", message);
        if (!this.client) {
            return;
        }
        debug("Sending PONG to Twitch IRC");
        this.emit(TwitchCommand.PING, message);
        this.client.send(`PONG ${message.parameters}`);
    }

    private onReconnect(message: TwitchMessage) {
        debug("Received RECONNECT from Twitch IRC", message);
        if (!this.client) {
            return;
        }
        debug("Reconnecting to Twitch IRC");
        this.emit(TwitchCommand.RECONNECT, message);
        this.client.close();
        this.connect();
    }

    public join() {
        if (!this.client) {
            throw new Error("Client is not connected");
        }
        const normalizedChannel = "#" + this.channel.toLocaleLowerCase().trim();
        debug(`Joining channel ${normalizedChannel} on Twitch IRC`);
        this.client.send(`JOIN ${normalizedChannel}`);
    }

    public sendPrivateMessage(message: string) {
        if (!this.client) {
            throw new Error("Client is not connected");
        }
        debug("Sending private message to Twitch IRC", message);
        this.client.send(`PRIVMSG #${this.channel} :${message}`);
    }
}
