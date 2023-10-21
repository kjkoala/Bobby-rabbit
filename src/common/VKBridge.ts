import bridge, { EAdsFormats } from '@vkontakte/vk-bridge';

export class VK {
    static init() {
        bridge.send("VKWebAppInit", {});
    }

    static checkAds() {
        bridge.send('VKWebAppCheckNativeAds', { ad_format: EAdsFormats.INTERSTITIAL});
    }

    static showAds() {
        bridge.send('VKWebAppShowNativeAds', { ad_format: EAdsFormats.INTERSTITIAL })
  .then((data) => {
    if (data.result)
      console.log('Реклама показана');
    else
      console.log('Ошибка при показе');
  })
  .catch((error) => { console.log(error); /* Ошибка */ });
    }
}