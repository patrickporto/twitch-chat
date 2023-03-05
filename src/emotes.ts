import { TwitchChat } from "./chat";
import { debug } from "./debug";
import { getUserData } from "./twitch-client/user";

export interface Daum {
  id: string;
  name: string;
  images: Images;
  format: string[];
  scale: string[];
  theme_mode: string[];
}

export interface Images {
  url_1x: string;
  url_2x: string;
  url_4x: string;
}

type TwitchEmote = {
  data: Daum[];
  template: string;
};

export class TwitchEmotes {
  private emotes: Record<string, string> = {};

  constructor(
    private readonly oauthToken: string,
    private readonly clientId: string,
    private readonly username: string,
    twitchChat: TwitchChat
  ) {
    twitchChat.addPreprocessor(this.preprocessChatMessage.bind(this));
  }

  private async getGlobalEmotes(): Promise<TwitchEmote> {
    debug("Getting global emotes");
    const response = await fetch(
      "https://api.twitch.tv/helix/chat/emotes/global",
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + this.oauthToken.replace("oauth:", ""),
          "Client-Id": this.clientId,
          "Content-Type": "application/json",
        },
      }
    );
    return response.json();
  }

  private async getChannelEmotes(): Promise<TwitchEmote> {
    debug("Getting channel emotes");
    const user = await getUserData(this.oauthToken, this.clientId, this.username);
    const response = await fetch(
      `https://api.twitch.tv/helix/chat/emotes/global?broadcaster_id=${user.id}`,
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + this.oauthToken.replace("oauth:", ""),
          "Client-Id": this.clientId,
          "Content-Type": "application/json",
        },
      }
    );
    return response.json();
  }


  public async load() {
    const globalEmotes = await this.getGlobalEmotes()
    for(const emote of globalEmotes.data) {
      this.emotes[emote.name] = emote.images.url_1x
    }
    const channelEmotes = await this.getChannelEmotes()
    for(const emote of channelEmotes.data) {
      this.emotes[emote.name] = emote.images.url_1x
    }
  }

  preprocessChatMessage(message: string): string {
    debug("Preprocessing chat message", message.split(" "), this.emotes);
    message.split(" ").forEach((word) => {
        if (word in this.emotes) {
            message = message.replace(word, `<img src="${this.emotes[word]}" class="twitch-chat-emote" />`)
        }
    })
    return message
  }
}
