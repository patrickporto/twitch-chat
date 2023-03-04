import { CANONICAL_NAME } from "./constants";

export class TwitchUserSettings {
  constructor() {
    (game as Game).settings.register(CANONICAL_NAME, "twitchUserId", {
      name: (game as Game).i18n.localize("TWITCHCHAT.FoundryUser"),
      hint: (game as Game).i18n.localize("TWITCHCHAT.FoundryUserHint"),
      scope: "world",
      requiresReload: true,
      config: true,
      type: String,
      default: (game as Game)?.userId || '',
      choices: this.getUsersFromFoundry()
    });
  }

  private getUsersFromFoundry(): Record<string, string> {
    const users: Record<string, string> = {}
    for(const [userId, user] of ((game as Game)?.users as Users).entries()) {
        users[userId] = user?.name ?? userId;
    }
    return users;
  }

  public get twitchUserId(): string {
    return (game as Game).settings.get(CANONICAL_NAME, "twitchUserId") as string;
  }
}
