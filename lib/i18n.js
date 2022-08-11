import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

import initI18N from '@nuogz/i18n';

import { copyJSON } from './tool.js';



const dirPackage = dirname(fileURLToPath(import.meta.url));
const I18N = await initI18N(resolve(dirPackage, '..'));


export const T = (key, options = {}, lng) => {
	return I18N.t(key, Object.assign(copyJSON(options), { lng }));
};

export const TT = locale => (key, options) => T(key, options, locale);
