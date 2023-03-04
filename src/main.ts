import "./styles.css";
import { debug, registerDebugSettings } from "./debug";
import { TwitchClient } from "./twitch-client/client";
import { TwitchNotice } from "./notice";
import { TwitchClientSettings } from "./twitch-client/settings";
import { TwitchChat } from "./chat";
import { TwitchUserSettings } from "./user";

let clientSettings: TwitchClientSettings;
let userSettings: TwitchUserSettings;
let client: TwitchClient;
let twitchNoticeNotification: TwitchNotice;
let twitchChat: TwitchChat;

Hooks.on("init", function () {
  clientSettings = new TwitchClientSettings();
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
  twitchChat = new TwitchChat(client);
  client.connect();
});
