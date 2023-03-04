import { MODULE_NAME, TwitchCommand } from "./constants";
import { debug } from "./debug";
import { TwitchClient } from "./twitch-client/client";
import { TwitchMessage } from "./twitch-client/message-parser";

export class TwitchChat {
  constructor(private readonly twitchClient: TwitchClient) {
    this.twitchClient.on(
      TwitchCommand.PRIVATE_MESSAGE,
      this.onMessage.bind(this)
    );
  }

  private onMessage(message: TwitchMessage) {
    debug("Chat message received", message);
    ChatMessage.create({
      content: message.parameters,
      speaker: ChatMessage.getSpeaker({ alias: message?.source?.nick }),
    });
  }
}
