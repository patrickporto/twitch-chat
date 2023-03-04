import "./styles.css";
import { debug, registerDebugSettings } from "./debug";
import { TwitchClient } from "./twitch-client/client";
import { TwitchNotice } from "./notice";
import { TwitchClientSettings } from "./twitch-client/settings";
import { TwitchChat } from "./chat";

let settings: TwitchClientSettings;
let client: TwitchClient;
let twitchNoticeNotification: TwitchNotice
let twitchChat: TwitchChat

Hooks.on("init", function () {
  settings = new TwitchClientSettings()
  registerDebugSettings()
});

Hooks.on("ready", async function () {
  client = new TwitchClient(settings.channel, settings.username, settings.oauthToken);
  twitchNoticeNotification = new TwitchNotice(client);
  twitchChat = new TwitchChat(client);
  client.connect();
});

