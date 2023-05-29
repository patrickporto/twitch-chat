import "./styles.css";
import { debug, isEnableConnectionNotices, registerDebugSettings } from "./debug";
import { TwitchClient } from "./twitch-client/client";
import { TwitchNotice } from "./notice";
import { TwitchClientSettings } from "./twitch-client/settings";
import { TwitchChat, TwitchChatSettings } from "./chat";
import { TwitchEmotes } from "./emotes";
import { CANONICAL_NAME, MessageStyle, TwitchChatEvent } from "./constants";
import { ChatMessageData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs";
import { getUserData } from "./twitch-client/user";

const TWITCH_CHAT_OAUTH_CLIENT_ID = "q6batx0epp608isickayubi39itsckt";

let clientSettings: TwitchClientSettings;
let client: TwitchClient;
let twitchNoticeNotification: TwitchNotice;
let twitchChat: TwitchChat;
let twitchEmojis: TwitchEmotes;
let twitchChatSettings: TwitchChatSettings;
let socket: any;

Hooks.on("init", function () {
    clientSettings = new TwitchClientSettings();
    twitchChatSettings = new TwitchChatSettings();
    registerDebugSettings();
});

Hooks.once("socketlib.ready", () => {
    // @ts-ignore
    socket = socketlib.registerModule(CANONICAL_NAME);
});

Hooks.once("ready", async function () {
    if (!(game as Game).user?.isGM) {
        debug("Not a GM, skipping");
        return
    }
    const users = ((game as Game).users as Users).filter(user => user.isGM && user.active)
    if (users.length > 1 && users[0]?.id !== (game as Game).user?.id) {
        debug("Another GM is active, skipping");
        (ui as any).notifications?.warn("Another GM is active, skipping");
        return
    }
    client = new TwitchClient(
        clientSettings.channel,
        clientSettings.username,
        clientSettings.oauthToken
    );
    if (isEnableConnectionNotices()) {
        twitchNoticeNotification = new TwitchNotice(client);
    }
    twitchChat = new TwitchChat(client, twitchChatSettings, socket);
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

Hooks.once("chatCommandsReady", function (commands: any) {
    commands.register({
        name: "/t",
        module: "twitch-chat",
        aliases: ["/t", "%"],
        description: (game as Game).i18n.localize(
            "TWITCHCHAT.ChatCommandSendMsgToTwitch"
        ),
        icon: "<i class='fas fa-messages'></i>",
        requiredRole: "NONE",
        callback: (chatlog: ChatLog, messageText: string, chatdata: any) => {
            socket.executeAsGM(TwitchChatEvent.SEND_MESSAGE, {
                chatlog,
                messageText,
                chatdata,
            });
            return { content: messageText }
        },
        closeOnComplete: true
    });
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
