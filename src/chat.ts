import { MODULE_NAME, TwitchCommand } from "./constants";
import { debug } from "./debug";
import { TwitchClient } from "./twitch-client/client";
import { TwitchMessage } from "./twitch-client/message-parser";

type Preprocessor = (message: string) => string;

export class TwitchChat {
  private preprocessors: Preprocessor[] = [];

  constructor(private readonly twitchClient: TwitchClient) {
    this.twitchClient.on(
      TwitchCommand.PRIVATE_MESSAGE,
      this.onMessage.bind(this)
    );
  }

  private onMessage(message: TwitchMessage) {
    debug("Chat message received", message);
    ChatMessage.create({
      content: this.preprocess(message.parameters),
      speaker: ChatMessage.getSpeaker({ alias: message?.source?.nick ?? MODULE_NAME }),
    });
  }

  private preprocess(message: string) {
    for (const preprocessor of this.preprocessors) {
      message = preprocessor(message);
    }
    return message;
  }

  public addPreprocessor(preprocessor: Preprocessor) {
    this.preprocessors.push(preprocessor);
  }

  public async sendMessage(chatlog: ChatLog, messageText: string, chatdata: any) {
    this.twitchClient.sendPrivateMessage(messageText);
  }
}
