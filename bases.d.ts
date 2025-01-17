import { File } from '@koa/multer';
import KoaRouter from '@koa/router';
import { KoaContext } from '@nuogz/desire';

import Wockman from '@nuogz/wock-server';



export type Mare = KoaRouter.Middleware;

/** Mare(Middleware) Initial Function */
export type MareIniter = (desire: Desire) => Promise<Mare>;

/** Mare(Middleware) Initial Option */
export type MareInitOption = MareIniter[] | string;

/**
 * Mare(Middleware) option for Wock.
 * - Its route is the same as Face by default.
 */
export type WockMareOption = {
	/** An array for before-mare initer, or a string for one built-in mare. */
	before?: MareInitOption | undefined;
	/** An array for after-mare initer, or a string for one built-in mare. */
	after?: MareInitOption | undefined;
	/** An array for upgrade-mare initer, or a string for one built-in mare. */
	upgrade?: MareInitOption | undefined;
	/** An array for close-mare initer, or a string for one built-in mare. */
	close?: MareInitOption | undefined;
};
/**
 * Wock option
 * - Wock, abbreviation for `WebSocket`.
 * - Its route is the same as Face by default.
 */
export type WockOption = {
	/** Indicates whether disabled. `undefined` or `true` for disabled；`false` for enabled. */
	disable?: boolean | undefined;
	/** Route under WebSocket. **ATTENTION** This option is fully independent that will not concat with `{HarbourOption.facePrefix}` */
	route?: string | undefined;
	/** Indicates whether send `ping` event after websocket connected. `undefined` or `false` for not send；`true` for will send */
	ping?: boolean | undefined;
	/** Mare(Middleware) option for Wock. */
	mare?: WockMareOption | undefined;
};
/**
 * Mare(Middleware) option map
 * - Mare, abbreviation for `Middleware`.
 * - Its route is the same as Face by default.
 */
export type MareOptionMap = {
	/** An array for before-mare initer, or a string for one built-in mare. */
	before?: MareInitOption | undefined;
	/** An array for after-mare initer, or a string for one built-in mare. */
	after?: MareInitOption | undefined;
};
/** Folder mapping option */
export type FolderOption = {
	/** the prefix of URL path, not affected by `{HarbourOption.facePrefix}` */
	prefix: string;
	/** the location in the file system */
	location: string;
	/** `koa-static` option */
	option: import("koa-static").Options;
};
export type FaceMethod = "get" | "post" | "options" | "head" | "put" | "patch" | "delete" | "wock" | string;
/** Face option */
export type FaceOption = {
	/** Multi methods splited by `,`. methods used in `koa-router` (HTTP 1.1), or `wock` for wock face */
	method: FaceMethod;
	route: string;
	handle: HTTPFaceHandle;
	/** Indicates whether file upload is enabled. `undefined` or `true` for enabled；`false` for disabled */
	upload: boolean;
	destUpload?: string | undefined;
	option?: {
		parseRaw?: boolean | undefined;
	};
};
export type MulterFile = File;
/** Folder mapping option */
export type HTTPFaceKoaContext = {
	face: FaceOption,
	raw?: {
		$files?: { [x: string]: MulterFile[]; } | MulterFile[] | undefined,
		$sourcesRaw: {},
	},
};
export type HTTPFaceHandle = (raw: HTTPFaceKoaContext, ctx: import("@nuogz/desire").KoaContext, route: string, face: FaceOption, desire: Desire) => any;
export type ExtendedMare = (ctx: KoaContext & HTTPFaceKoaContext, param: import("@nuogz/desire").Koa.Next) => any;
export type HarbourOption = {
	/** prefix for interface */
	facePrefix?: string | undefined;
	/** the options of interfaces */
	faces?: FaceOption[] | undefined;
	/** the options of folder mappings */
	folds?: FolderOption[] | undefined;
	/** the options of mare */
	mare?: MareOptionMap | undefined;
	/** Wock option */
	wock?: WockOption | undefined;
	/** module `multer` option */
	multer?: import("@koa/multer").Options | undefined;
	destUpload?: string | undefined;
};
export type Desire = import("@nuogz/desire").default;
export type DesireExtend = {
	optionHarbour: HarbourOption;
	router: KoaRouter;
	wockman: Wockman;
	multer: import("@koa/multer").Instance;
};
export type DesireWithHarbour = DesireExtend & Desire;
