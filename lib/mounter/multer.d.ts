/** @param {import('@koa/multer').Options} options */
export function createMulter(options: import("@koa/multer").Options): MulterRaw.Multer;
export const diskStorage: typeof MulterRaw.diskStorage;
export const memoryStorage: typeof MulterRaw.memoryStorage;
import MulterRaw from 'multer';
