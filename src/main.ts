import "./styles.css";
import { debug, registerDebugSettings } from "./debug";
import { TwitchClient } from "./twitch-client/client";
import { TwitchNoticeNotification } from "./notice-notification";
import { TwitchClientSettings } from "./twitch-client/settings";

let settings: TwitchClientSettings;
let client: TwitchClient;
let twitchNoticeNotification: TwitchNoticeNotification

Hooks.on("init", function () {
  settings = new TwitchClientSettings()
  registerDebugSettings()
  twitchNoticeNotification = new TwitchNoticeNotification(client);
});

Hooks.on("ready", async function () {
  client = new TwitchClient(settings.channel, settings.username, settings.oauthToken);
  client.connect();
});

