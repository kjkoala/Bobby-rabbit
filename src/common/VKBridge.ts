import bridge, { EAdsFormats } from '@vkontakte/vk-bridge';
import { carrots_levels, eggs_levels } from './constants';
const noop = () => {}
class VK {
  private countLevels: number;
  private whenShowAds: number;
  private prev: number;
  private Ysdk: any;
  constructor() {
    this.countLevels = 0;
    this.whenShowAds = 5;
    this.prev = this.whenShowAds - 1;

    
    YaGames.init()
    .then((sdk) => {
      this.Ysdk = sdk
    })
  }
    static init() {
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

    loadingComplete() {
      this.Ysdk?.features.LoadingAPI?.ready();
    }

    setSave(key: string, value: string){
      return undefined
      bridge.send("VKWebAppStorageSet", {
        key,
        value
      })
      .catch(noop)
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
        this.Ysdk.adv.showFullscreenAdv({
          callback: {
            onClose: resolve,
            onError: reject
          }
        })
          return bridge.send('VKWebAppShowNativeAds', { ad_format: EAdsFormats.INTERSTITIAL })
          .catch(noop);
      })
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