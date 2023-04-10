export default class DesireHarbour {
    /** @param {DesireWithHarbour} desire */
    init(desire: DesireWithHarbour): Promise<DesireHarbour>;
}
export type Mare = KoaRouter.Middleware;
/**
 * Mare(Middleware) Initial Function
 * - Promise is supported.
 */
export type MareIniter = Function;
/**
 * Mare(Middleware) Initial Option
 */
export type MareInitOption = Array<MareIniter> | string;
/**
 * Mare(Middleware) option for Wock.
 * - Its route is the same as Face by default.
 */
export type WockMareOption = {
    /**
     * An array for before-mare initer, or a string for one built-in mare.
     */
    before?: MareInitOption;
    /**
     * An array for after-mare initer, or a string for one built-in mare.
     */
    after?: MareInitOption;
    /**
     * An array for upgrade-mare initer, or a string for one built-in mare.
     */
    upgrade?: MareInitOption;
    /**
     * An array for close-mare initer, or a string for one built-in mare.
     */
    close?: MareInitOption;
};
/**
 * Wock option
 * - Wock, abbreviation for `WebSocket`.
 * - Its route is the same as Face by default.
 */
export type WockOption = {
    /**
     * Indicates whether disabled. `undefined` or `true` for disabled；`false` for enabled.
     */
    disable?: boolean;
    /**
     * Route under WebSocket. **ATTENTION** This option is fully independent that will not concat with `{HarbourOption.facePrefix}`
     */
    route?: string;
    /**
     * Indicates whether send `ping` event after websocket connected. `undefined` or `false` for not send；`true` for will send
     */
    ping?: boolean;
    /**
     * Mare(Middleware) option for Wock.
     */
    mare?: WockMareOption;
};
/**
 * Mare(Middleware) option map
 * - Mare, abbreviation for `Middleware`.
 * - Its route is the same as Face by default.
 */
export type MareOptionMap = {
    /**
     * An array for before-mare initer, or a string for one built-in mare.
     */
    before?: MareInitOption;
    /**
     * An array for after-mare initer, or a string for one built-in mare.
     */
    after?: MareInitOption;
};
/**
 * Folder mapping option
 */
export type FolderOption = {
    /**
     * the prefix of URL path, not affected by `{HarbourOption.facePrefix}`
     */
    prefix: string;
    /**
     * the location in the file system
     */
    location: string;
    /**
     * `koa-static` option
     */
    option: import('koa-static').Options;
};
/**
 * Face option
 */
export type FaceOption = {
    /**
     * Multi methods splited by `;`. methods used in `koa-router` (HTTP 1.1), or `wock` for wock face
     */
    method: string;
    route: string;
    handle: Function;
    /**
     * Indicates whether file upload is enabled. `undefined` or `true` for enabled；`false` for disabled
     */
    upload: boolean;
    destUpload?: string;
};
export type HarbourOption = {
    /**
     * prefix for interface
     */
    facePrefix?: string;
    /**
     * the options of interfaces
     */
    faces?: FaceOption[];
    /**
     * the options of folder mappings
     */
    folds?: FolderOption[];
    /**
     * the options of mare
     */
    mare?: MareOptionMap;
    /**
     * Wock option
     */
    wock?: WockOption;
    /**
     * module `multer` option
     */
    multer?: import('@koa/multer').Options;
    destUpload?: string;
};
export type Desire = import('@nuogz/desire').default;
export type DesireExtend = {
    optionHarbour: HarbourOption;
    router: KoaRouter;
    wockman: Wockman;
    multer: import('@koa/multer').Instance;
};
export type DesireWithHarbour = DesireExtend & Desire;
import KoaRouter from "@koa/router";
import Wockman from "@nuogz/wock-server";
