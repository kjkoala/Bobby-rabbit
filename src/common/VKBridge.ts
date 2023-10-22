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
        bridge.send('VKWebAppShowNativeAds', { ad_format: EAdsFormats.INTERSTITIAL })
  .then((data) => {
    if (data.result)
      console.log('Реклама показана');
    else
      console.log('Ошибка при показе');
  })
  .catch((error) => { console.log(error); /* Ошибка */ });
    }

    countLevel() {
      this.countLevels += 1
      if (this.countLevels === 4) {
        this.checkAds()
      } else if (this.countLevels >= 5) {
        this.countLevels = 0;
        this.showAds()
      }
    }
}

export default VK.init()