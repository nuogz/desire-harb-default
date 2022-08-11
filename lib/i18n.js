import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

import initI18N, { T as T_, TT as TT_ } from '@nuogz/i18n';



await initI18N(resolve(dirname(fileURLToPath(import.meta.url)), '..'));



export const T = T_;
export const TT = TT_;
