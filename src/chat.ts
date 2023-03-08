import { ChatMessageData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/module.mjs";
import {
    CANONICAL_NAME,
    MessageStyle,
    MODULE_NAME,
    TwitchChatEvent,
    TwitchCommand,
} from "./constants";
import { debug } from "./debug";
import { TwitchClient } from "./twitch-client/client";
import { TwitchMessage } from "./twitch-client/message-parser";

type Preprocessor = (message: string) => string;

export class TwitchChat {
    private preprocessors: Preprocessor[] = [];

    constructor(
        private readonly twitchClient: TwitchClient,
        private readonly settings: TwitchChatSettings,
        private readonly socket: any
    ) {
        this.twitchClient.on(
            TwitchCommand.PRIVATE_MESSAGE,
            this.onMessage.bind(this)
        );
        this.socket.register(TwitchChatEvent.MESSAGE_RECEIVED, this.sendChatMessage.bind(this));
        this.socket.register(TwitchChatEvent.SEND_MESSAGE, (payload: any) => {
            debug("Socket message received", payload);
            this.sendMessage(
                payload.chatlog,
                payload.messageText,
                payload.chatdata
            );
        });
    }

    private onMessage(message?: TwitchMessage) {
        if (!message) {
            throw new Error("Message is undefined");
        }
        this.socket.executeAsGM(TwitchChatEvent.MESSAGE_RECEIVED, message)
    }

    private sendChatMessage(message: TwitchMessage) {
        debug("Chat message received", message);
        const data: Partial<ChatMessageData> = {
            content: this.preprocess(message.parameters),
            flags: {
                [CANONICAL_NAME]: {
                    speaker: message.source?.nick,
                },
            },
        };
        if (this.settings.messageStyle === MessageStyle.USERNAME_AS_FLAVOR) {
            // @ts-ignore
            data.speaker = ChatMessage.getSpeaker({ alias: MODULE_NAME });
            data.flavor = message.source?.nick ?? "";
        } else {
            // @ts-ignore
            data.speaker = ChatMessage.getSpeaker({
                alias: message?.source?.nick ?? MODULE_NAME,
            });
        }
        ChatMessage.create(data);
    }

    private preprocess(message: string) {
        for (const preprocessor of this.preprocessors) {
            message = preprocessor(message);
        }
        return message;
    }

    public addPreprocessor(preprocessor: Preprocessor) {
        this.preprocessors.push(preprocessor);
    }

    public async sendMessage(
        chatlog: ChatLog,
        messageText: string,
        chatdata: any
    ) {
        this.twitchClient.sendPrivateMessage(messageText);
    }
}

export class TwitchChatSettings {
    constructor() {
        (game as Game).settings.register(CANONICAL_NAME, "messageStyle", {
            name: (game as Game).i18n.localize("TWITCHCHAT.MessageStyle"),
            hint: (game as Game).i18n.localize("TWITCHCHAT.MessageStyleHint"),
            scope: "world",
            config: true,
            type: String,
            default: MessageStyle.USERNAME_AS_ALIAS,
            // @ts-ignore
            choices: {
                [MessageStyle.USERNAME_AS_ALIAS]: (game as Game).i18n.localize(
                    "TWITCHCHAT.MessageStyleUsernameAsAlias"
                ),
                [MessageStyle.USERNAME_AS_FLAVOR]: (game as Game).i18n.localize(
                    "TWITCHCHAT.MessageStyleUsernameAsFlavor"
                ),
            },
        });

        if ((game as Game).modules.get("color-picker")?.active) {
            // @ts-ignore
            ColorPicker.register(CANONICAL_NAME, "messageBorderColor", {
                name: (game as Game).i18n.localize("TWITCHCHAT.MessageBorderColor"),
                hint: (game as Game).i18n.localize(
                    "TWITCHCHAT.MessageBorderColorHint"
                ),
                scope: "world",
                config: true,
                default: "#6441a5",
            }, {
                format: 'hexa'
            })
        } else {
            (game as Game).settings.register(CANONICAL_NAME, "messageBorderColor", {
                name: (game as Game).i18n.localize("TWITCHCHAT.MessageBorderColor"),
                hint: (game as Game).i18n.localize(
                    "TWITCHCHAT.MessageBorderColorHint"
                ),
                scope: "world",
                config: true,
                type: String,
                default: "#6441a5",
            });
        }
    }

    public get messageStyle(): MessageStyle {
        return (game as Game).settings.get(
            CANONICAL_NAME,
            "messageStyle"
        ) as MessageStyle;
    }

    public get messageBorderColor(): string {
        return (game as Game).settings.get(
            CANONICAL_NAME,
            "messageBorderColor"
        ) as string;
    }
}
