import bridge, { EAdsFormats } from '@vkontakte/vk-bridge';

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
        bridge.send("VKWebAppInit", {});
        return new VK()
    }

    inviteFriend() {
      bridge.send('VKWebAppShowInviteBox')
      .then(() => {})
      .catch(console.error)
    }

    checkAds() {
        bridge.send('VKWebAppCheckNativeAds', { ad_format: EAdsFormats.INTERSTITIAL})
        .catch(console.error)
    }

    showAds() {
        return bridge.send('VKWebAppShowNativeAds', { ad_format: EAdsFormats.INTERSTITIAL })
        .then((data) => data)
        .catch(console.error);
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