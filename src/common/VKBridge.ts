import bridge, { EAdsFormats } from '@vkontakte/vk-bridge';
import { carrots_levels, eggs_levels } from './constants';
const noop = () => {}
class VK {
  private countLevels: number;
  private whenShowAds: number;
  private prev: number;
  constructor() {
    this.countLevels = 0;
    this.whenShowAds = 6;
    this.prev = this.whenShowAds - 1;
  }
    static init() {
        bridge.send("VKWebAppInit", {})
        .then(this.getVKSaves)
        .catch(console.error)

        return new VK()
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

    countLevel() {
      this.countLevels += 1
      if (this.countLevels === this.prev) {
        this.checkAds()
      } else if (this.countLevels >= this.whenShowAds) {
        this.countLevels = 0;
        return this.showAds()
      }

      return Promise.resolve()
    }
}

export default VK.init()