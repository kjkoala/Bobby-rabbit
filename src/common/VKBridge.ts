import bridge, { EAdsFormats } from '@vkontakte/vk-bridge';
import { carrots_levels, eggs_levels, getLevelsLocalStorage } from './constants';

const noop = () => {}

const TWO_MIN_IN_MS = 120_000
class VK {
  private sdk: any;
  private awaitersSDK: ((values: unknown) => void)[] = []
  private addCountMS: number;

  constructor() {
    this.addCountMS = 0;
    
    YaGames.init()
    .then((sdk) => this.setSDK(sdk))
    .catch(console.error)
    
    }

  static init() {
      return new VK()
    }

    getSave() {
      this.getSDK()
      .then((sdk: any) => sdk.getPlayer())
      .then((player: any) => {
        if (player.getMode() !== 'lite') {
          player.getData()
          .then((data: any) => {
            if (eggs_levels in data) {
              localStorage.setItem(eggs_levels, JSON.stringify(data[eggs_levels]))
            }
            if (carrots_levels in data) {
              localStorage.setItem(carrots_levels, JSON.stringify(data[carrots_levels]))
            }
          })
        }
      })
    }

    getSDK() {
      return new Promise((resolve) => {
        if (this.sdk) {
          resolve(this.sdk)
        } else {
          this.awaitersSDK.push(resolve)
        }
      })
    }

    setSDK(sdk: any) {
      return new Promise((resolve) => {
        this.sdk = sdk
        this.awaitersSDK.forEach((resolve) => resolve(this.sdk));
        this.awaitersSDK = []
        resolve(this.sdk)
      })
    }

    loadingComplete() {
      this.getSDK()
      .then((sdk: any) => {
        sdk.features.LoadingAPI?.ready();
      })
    }

    setSave(key: string, value: string){
      this.getSDK()
      .then((sdk: any) => sdk.getPlayer())
      .then((player: any) => {
        if (player.getMode() !== 'lite') {
          const difKey = key === carrots_levels ? eggs_levels : carrots_levels ;

          player.setData({
            [key]: JSON.parse(value || '[]'),
            [difKey]: getLevelsLocalStorage(difKey),
          })
          .catch(noop)
        }
      })
    }

    inviteFriend() {
      return undefined
      bridge.send('VKWebAppShowInviteBox')
      .catch(noop)
    }

    checkAds() {
      return Promise.resolve()
        bridge.send('VKWebAppCheckNativeAds', { ad_format: EAdsFormats.INTERSTITIAL})
        .catch(noop)
    }

    showAds() {
      return new Promise((resolve, reject) => {
        this.getSDK()
        .then((sdk: any) => {
          sdk.adv.showFullscreenAdv({
            callbacks: {
              onClose: resolve,
              onError: reject,
            }
          })
        })
        return undefined
        bridge.send('VKWebAppShowNativeAds', { ad_format: EAdsFormats.INTERSTITIAL })
          .catch(noop);
      })
    }

    countLevel(ms: number) {
      this.addCountMS += ms
      if (this.addCountMS > TWO_MIN_IN_MS) {
        this.addCountMS = 0;
        return this.showAds()
        .then(() => this.checkAds())
        .catch(noop)
      }

      return Promise.resolve()
    }
}

export default VK.init()