import "./styles.css";
import { debug, registerDebugSettings } from "./debug";
import { TwitchClient } from "./twitch-client/client";
import { TwitchNotice } from "./notice";
import { TwitchClientSettings } from "./twitch-client/settings";
import { TwitchChat, TwitchChatSettings } from "./chat";
import { TwitchUserSettings } from "./user";
import { TwitchEmotes } from "./emotes";
import { CANONICAL_NAME, MessageStyle } from "./constants";
import { ChatMessageData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs";
import { getUserData } from "./twitch-client/user";

const TWITCH_CHAT_OAUTH_CLIENT_ID = "q6batx0epp608isickayubi39itsckt";

let clientSettings: TwitchClientSettings;
let userSettings: TwitchUserSettings;
let client: TwitchClient;
let twitchNoticeNotification: TwitchNotice;
let twitchChat: TwitchChat;
let twitchEmojis: TwitchEmotes;
let twitchChatSettings: TwitchChatSettings;

Hooks.on("init", function () {
    clientSettings = new TwitchClientSettings();
    twitchChatSettings = new TwitchChatSettings();
    registerDebugSettings();
});

Hooks.once("ready", async function () {
    userSettings = new TwitchUserSettings();
    if ((game as Game).userId !== userSettings.twitchUserId) {
        return;
    }
    client = new TwitchClient(
        clientSettings.channel,
        clientSettings.username,
        clientSettings.oauthToken
    );
    twitchNoticeNotification = new TwitchNotice(client);
    twitchChat = new TwitchChat(client, twitchChatSettings);
    if (clientSettings.showTwitchEmotes) {
        twitchEmojis = new TwitchEmotes(
            clientSettings.oauthToken,
            TWITCH_CHAT_OAUTH_CLIENT_ID,
            clientSettings.username,
            twitchChat
        );
        await twitchEmojis.load();
    }
    client.connect();
});

Hooks.once("chatCommandsReady", function (chatCommands: any) {
    chatCommands.registerCommand(
        chatCommands.createCommandFromData({
            commandKey: "/twitch",
            invokeOnCommand: (
                chatlog: ChatLog,
                messageText: string,
                chatdata: any
            ) => {
                twitchChat.sendMessage(chatlog, messageText, chatdata);
            },
            shouldDisplayToChat: true,
            iconClass: "fa-messages",
            description: (game as Game).i18n.localize(
                "TWITCHCHAT.ChatCommandSendMsgToTwitch"
            ),
            gmOnly: false,
        })
    );
});

Hooks.on(
    "renderChatMessage",
    async (chatMessage: ChatMessageData, html: JQuery, data: any) => {
        if (CANONICAL_NAME in chatMessage.flags) {
            // @ts-ignore
            const speaker = chatMessage?.flags[CANONICAL_NAME]?.speaker;
            const user = await getUserData(
                clientSettings.oauthToken,
                TWITCH_CHAT_OAUTH_CLIENT_ID,
                speaker
            );
            $(html)
                .addClass("twitch-chat-message")
                .css("border-color", twitchChatSettings.messageBorderColor);
            $(html)
                .find(".chat-portrait-message-portrait-generic")
                .attr("src", user.profile_image_url)
                .css("border-color", twitchChatSettings.messageBorderColor);
            if (
                twitchChatSettings.messageStyle ===
                MessageStyle.USERNAME_AS_FLAVOR
            ) {
                $(html)
                    .find(".flavor-text.chat-portrait-text-size-name-generic")
                    .text(user.display_name);
            } else {
                $(html)
                    .find("h4.chat-portrait-text-size-name-generic")
                    .text(user.display_name);
            }
        }
    }
);
