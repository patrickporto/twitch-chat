import { CANONICAL_NAME } from "../constants";

export class TwitchClientSettings {
  constructor() {
    (game as Game).settings.register(CANONICAL_NAME, "channel", {
      name: (game as Game).i18n.localize("TWITCHCHAT.TwitchChannel"),
      hint: (game as Game).i18n.localize("TWITCHCHAT.TwitchChannelHint"),
      scope: "world",
      requiresReload: true,
      config: true,
      type: String,
      default: '',
    });
    (game as Game).settings.register(CANONICAL_NAME, "username", {
      name: (game as Game).i18n.localize("TWITCHCHAT.TwitchUsername"),
      hint: (game as Game).i18n.localize("TWITCHCHAT.TwitchUsernameHint"),
      scope: "world",
      requiresReload: true,
      config: true,
      type: String,
      default: '',
    });
    (game as Game).settings.register(CANONICAL_NAME, "oauthToken", {
      name: (game as Game).i18n.localize("TWITCHCHAT.TwitchOAuthToken"),
      hint: (game as Game).i18n.localize("TWITCHCHAT.TwitchOAuthTokenHint"),
      scope: "world",
      requiresReload: true,
      config: true,
      type: String,
      default: '',
    });
  }

  public get channel(): string {
    return (game as Game).settings.get(CANONICAL_NAME, "channel") as string;
  }

  public get username(): string {
    return (game as Game).settings.get(CANONICAL_NAME, "username") as string;
  }

  public get oauthToken(): string {
    return (game as Game).settings.get(CANONICAL_NAME, "oauthToken") as string;
  }
}
