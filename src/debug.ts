import { CANONICAL_NAME, MODULE_NAME } from "./constants";

export const debug = (...args: any[]) => {
    // @ts-ignore
    if (game.settings.get(CANONICAL_NAME, 'debug')) {
        console.log(`${MODULE_NAME} | `, ...args);
    }
}

export const isEnableConnectionNotices = (): boolean => {
    // @ts-ignore
    return game.settings.get(CANONICAL_NAME, 'connectionNotices');
}

export const registerDebugSettings = () => {
    (game as Game).settings.register(CANONICAL_NAME, 'debug', {
        name: (game as Game).i18n.localize(`TWITCHCHAT.DebugMode`),
        hint: (game as Game).i18n.localize(`TWITCHCHAT.DebugModeHint`),
        scope: 'world',
        config: true,
        type: Boolean,
        default: false,
    });
    (game as Game).settings.register(CANONICAL_NAME, 'connectionNotices', {
        name: (game as Game).i18n.localize(`TWITCHCHAT.ConnectionNotices`),
        hint: (game as Game).i18n.localize(`TWITCHCHAT.ConnectionNoticesHint`),
        scope: 'world',
        config: true,
        type: Boolean,
        default: true,
        requiresReload: true,
    });
}
