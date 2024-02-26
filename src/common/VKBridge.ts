import bridge, { EAdsFormats } from '@vkontakte/vk-bridge';
import { carrots_levels, eggs_levels } from './constants';
const noop = () => {}

const TWO_MIN_IN_MS = 120_000
class VK {
  private addCountMS: number;
  constructor() {
    this.addCountMS = 0;
  }
    static init() {
        bridge.send("VKWebAppInit", {})
        .then(this.getVKSaves)
        .catch(console.error)

        const initVK = new VK()

        initVK.checkAds()

        return initVK
    }

    static getVKSaves() {
      return bridge.send("VKWebAppStorageGet", {
        keys: [
          carrots_levels,
          eggs_levels
        ]
      }).then((data) => {
        if(data.keys) {
          data.keys.forEach((level) => {
              window.localStorage.setItem(level.key, level.value || '[]')
          })
        }
      })
    }

    setSave(key: string, value: string){
      bridge.send("VKWebAppStorageSet", {
        key,
        value
      })
      .catch(noop)
    }

    inviteFriend() {
      bridge.send('VKWebAppShowInviteBox')
      .catch(noop)
    }

    checkAds() {
        bridge.send('VKWebAppCheckNativeAds', { ad_format: EAdsFormats.INTERSTITIAL})
        .catch(noop)
    }

    showAds() {
        return bridge.send('VKWebAppShowNativeAds', { ad_format: EAdsFormats.INTERSTITIAL })
        .catch(noop);
    }

    countLevel(ms: number) {
      this.addCountMS += ms
      if (this.addCountMS > TWO_MIN_IN_MS) {
        console.log('more than 2min', this.addCountMS)
        this.addCountMS = 0;
        return this.showAds()
        .then(() => this.checkAds())
        .catch(noop)
      }
      console.log('less than 2min', this.addCountMS)

      return Promise.resolve()
    }
}

export default VK.init()