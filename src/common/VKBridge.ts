import bridge, { EAdsFormats } from '@vkontakte/vk-bridge';

class VK {
  private countLevels: number;
  constructor() {
    this.countLevels = 0;
  }
    static init() {
        bridge.send("VKWebAppInit", {});
        return new VK()
    }

    checkAds() {
        bridge.send('VKWebAppCheckNativeAds', { ad_format: EAdsFormats.INTERSTITIAL});
    }

    showAds() {
        return bridge.send('VKWebAppShowNativeAds', { ad_format: EAdsFormats.INTERSTITIAL })
  .then((data) => data)
  .catch((error) => { console.log(error); /* Ошибка */ });
    }

    countLevel() {
      this.countLevels += 1
      if (this.countLevels === 4) {
        this.checkAds()
      } else if (this.countLevels >= 5) {
        this.countLevels = 0;
        return this.showAds()
      }

      return Promise.resolve()
    }
}

export default VK.init()