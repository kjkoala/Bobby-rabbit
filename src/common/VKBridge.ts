import bridge, { EAdsFormats } from '@vkontakte/vk-bridge';
import { carrots_levels, eggs_levels, getLevelsLocalStorage } from './constants';
const noop = () => {}
class VK {
  private countLevels: number;
  private whenShowAds: number;
  private prev: number;
  private sdk: any;
  constructor() {
    this.countLevels = 0;
    this.whenShowAds = 5;
    this.prev = this.whenShowAds - 1;

    
    YaGames.init()
    .then((sdk) => {
      this.sdk = sdk
    })
    .then(() => this.getSave())
    .catch(console.error)
  }
    static init() {
      return new VK()
    }

    getSave() {
      this.sdk.getPlayer()
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

    loadingComplete() {
      this.sdk?.features.LoadingAPI?.ready();
    }

    setSave(key: string, value: string){
      this.sdk.getPlayer()
      .then((player: any) => {
        if (player.getMode() !== 'lite') {
          const difKey = key === carrots_levels ? eggs_levels : carrots_levels ;

          player.setData({
            [key]: JSON.parse(value || '[]'),
            [difKey]: getLevelsLocalStorage(difKey),
          })
          .catch(noop)
        }
      } )
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
        this.sdk.adv.showFullscreenAdv({
          callbacks: {
            onClose: resolve,
            onError: reject,
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