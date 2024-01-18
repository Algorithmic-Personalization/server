"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const loadConfigYamlRaw_1 = require("./../server/lib/config-loader/loadConfigYamlRaw");
const getYouTubeConfig_1 = require("./../server/lib/config-loader/getYouTubeConfig");
const youTubeApi_1 = require("./../server/lib/youTubeApi");
const loadApi = () => __awaiter(void 0, void 0, void 0, function* () {
    const config = yield (0, loadConfigYamlRaw_1.loadConfigYamlRaw)();
    const ytConfig = (0, getYouTubeConfig_1.getYouTubeConfig)(config);
    const api = yield (0, youTubeApi_1.makeCreateYouTubeApi)('with-cache')(ytConfig, jest.fn());
    return api;
});
const videoIds = [
    'OhwSUWqCCso',
    'VGHD9e3yRIU',
    'ht4tbCiFxeM',
    'dgqHFpP1w2k',
    'lsDUHUuTi-g',
    'JurplDfPi3U',
    'KVMJlitN5V8',
    'Vy-DjMZreIk',
    '2f7YwCtHcgk',
    'Sew_2qPq5qI',
    'e4VhO4T5IvE',
    'SB-k06PgIRE',
    'OpyTJbzA7Fk',
    'eKEorBipbO8',
    'KbJAqwypP7c',
    '6suEA3rSjeA',
    'A1nJRoPGkRs',
    'MovJeSAgJJ4',
    '7dmoH5dAvpY',
    'Vw8qwvCS3FU',
    'xmtI8SnR2go',
    'diCEDkn57-s',
    'sEL0-xSOvp4',
    'juM2ROSLWfw',
    'RY7uS9bm3Zk',
    'c_aFR9Nrj-E',
    'IGC5J_7gkKg',
    'xGOKEAVmQ-g',
    'Ekbqix9fKXQ',
    'QPVNaIZZKwo',
    '3-NGpNRGoy0',
    'hy8MEhoZZuE',
    '_AlDMPBAPac',
    '3BPzqH5sF90',
    'z2bmOGCh1Q8',
    'CHJsaq2lNjU',
    'Mhpwl24WcdU',
    '8_k5ARRz3kA',
    'yp90C0KWaY0',
    'iOx08RKXsfk',
    'ASQCa7mfjVo',
    'Ib-CGi0AEdM',
    'X_y-78OcUGA',
    'Qt04iIv9eOI',
    'pKrQ-7XNngc',
    '7Qe-wHF9Dh8',
    'dghic5oojZU',
    'IALsFU6LMAA',
    'EV6qS8xH24M',
    'WUN_n4rRFow',
    'OuLX68V4E4M',
    'ntwTC95rRQI',
    'SoOyaDWIoMA',
    'lDm00Ww6qE4',
    '5WZt1EcLMxc',
    'e_May8MXy14',
    'gxwiw7WrYM0',
    'e_hlxbW1v20',
    'L23akTkDqTM',
    'LQIvYN34r_M',
    'kSlY6WDOSQw',
    '3qQJG7ce59g',
    'W2ZACF5VPzc',
    'A1DtUg2L3a4',
    'mVBBJiTGfMo',
    'MVXg_eR-aLQ',
    'xRYnX2OQFHg',
    'jK0Edq7mQkA',
    'r3BNV9p36uE',
    'q0P0QC3hciU',
    '3Ke4QbFDH4A',
    'JMfUoxRDHb4',
    'Od7DbAF6pZ8',
    'pAohmcZROwg',
    'eQdfPZl_2yA',
    '2FAV5TMTk80',
    '89qAF0TeP-c',
    'WVN2pmOP8wI',
    'BWIUQRjgGoI',
    'gkaDhPwRMhc',
    'iCeu6tBO3oU',
    'U8lKExoVghg',
    'pQLv2Lmp5MQ',
    'eeCtFqqAqbY',
    'YO_cYhV6eIM',
    '3lLz-e9d1hc',
    'Ca0zQvAuhDI',
    'tFWXk04ufFk',
    'XKyMS68fshg',
    '6e8ZmB_UQXs',
    'oZDUrPXu64I',
    'YJ-t7AeZgHQ',
    'vF-ZFbMhLsw',
    'VSAtCqnbH_g',
    'zeH_U_li2Ic',
    'cEf8eXth900',
    'kBnT8lZVFkI',
    '7kNxIBqK7eg',
    '3dmpxN_WAJ0',
    'T78kyPlMaI0',
];
describe('the YouTube API', () => {
    it('should be able to get a few video metas', () => __awaiter(void 0, void 0, void 0, function* () {
        const api = yield loadApi();
        const ids = videoIds.slice(0, 5);
        expect(ids.length).toBe(5);
        const metaObtained = yield api.getMetaFromVideoIds(ids);
        expect(metaObtained.data.size).toBe(ids.length);
        api.cleanCache();
    }));
    it('should get more than 50 ids at once', () => __awaiter(void 0, void 0, void 0, function* () {
        const api = yield loadApi();
        const numOfIds = 68;
        const idsSubset = videoIds.slice(0, numOfIds);
        expect(idsSubset.length).toBe(numOfIds);
        const metaObtained = yield api.getMetaFromVideoIds(idsSubset);
        expect(metaObtained.data.size).toBe(numOfIds);
        api.cleanCache();
    }));
});
//# sourceMappingURL=youTube.test.js.map