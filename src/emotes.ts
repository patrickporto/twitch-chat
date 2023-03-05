import { TwitchChat } from "./chat";
import { debug } from "./debug";

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

  public async load() {
    const emotes = await this.getGlobalEmotes()
    for(const emote of emotes.data) {
      this.emotes[emote.name] = emote.images.url_1x
    }
  }

  preprocessChatMessage(message: string): string {
    debug("Preprocessing chat message", message.split(" "));
    debug("Emotes", this.emotes)
    message.split(" ").forEach((word) => {
        debug(word, this.emotes[word])
        if (word in this.emotes) {
            message = message.replace(word, `<img src="${this.emotes[word]}" class="twitch-chat-emote" />`)
        }
    })
    return message
  }
}
