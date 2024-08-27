/**
 * @param {string} methods
 * @param {import('../../bases.d.ts').FaceOption} face
 * @param {import('../../bases.d.ts').Mare[]} maresBefore
 * @param {import('../../bases.d.ts').Mare[]} maresAfter
 * @param {string} facePrefix
 * @param {import('../../bases.d.ts').DesireWithHarbour} desire
 */
export default function mountHTTPFace(methods: string, face: import("../../bases.d.ts").FaceOption, maresBefore: import("../../bases.d.ts").Mare[], maresAfter: import("../../bases.d.ts").Mare[], facePrefix: string, desire: import("../../bases.d.ts").DesireWithHarbour): Promise<void>;
