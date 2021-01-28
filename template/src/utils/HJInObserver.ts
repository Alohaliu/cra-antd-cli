import storageUtil from '@utils/storageUtil';
import { saveBuriedDataByApi } from '@utils/index';

export const inObserver = () => {
  const lastestStorageUserId = storageUtil.get('storageUserId') || '';
  const channelCode = storageUtil.get('storageChannelCode') || '';
  const deviceInfo = storageUtil.get('huafaDeviceInfo') || {};
  const channelVersion = deviceInfo.appVersion || '';

  let boxElement = null;
  let ele = [];
  let prevRatio = 0.5; // 卡片在可视页面出现一半以上自动曝光
  setTimeout(() => {
    for (let i = 0; i < document.getElementsByClassName('publicStyle').length; i++) {
      boxElement = document.getElementsByClassName('publicStyle')[i];
      createObserver();
    }
  }, 2000);

  const createObserver = () => {
    let options = {
      root: null, // null 为相对于视窗，也可为具体要监测的某个祖先元素
      rootMargin: '15px', // 距离祖先元素的 margin
      threshold: buildThresholdList() // 可见的阀值
    };
    let observer = new IntersectionObserver(handleIntersect, options);
    observer.observe(boxElement);
  };

  const buildThresholdList = () => {
    let thresholds = [];
    let numSteps = 10;

    for (let i = 1.0; i <= numSteps; i++) {
      let ratio = i / numSteps;
      thresholds.push(ratio);
    }

    thresholds.push(0);
    return thresholds;
  };
  const handleIntersect = (entries) => {
    entries.forEach(function (entry) {
      if (entry.intersectionRatio > prevRatio) {
        if (ele.indexOf(entry.target.dataset.id) === -1) { // 在这里可以做上报逻辑，曝光只需一次，在此做了限制
          saveBuriedDataByApi('小贷专区', '卡片曝光', 'KPBG0003', channelVersion, '', '', channelCode, '', lastestStorageUserId, '', entry.target.dataset.id, '', '', '', '', new Date().getTime());
          // 根据卡片id cardId 曝光所有卡片内的产品
          if (storageUtil.get('HJhuafaCardInfo') && storageUtil.get('HJhuafaCardInfo').length) {
            storageUtil.get('HJhuafaCardInfo').forEach(item => {
              if (item.cardId === entry.target.dataset.id) {
                item.customizePageDatas.forEach((itemI) => {
                  saveBuriedDataByApi('小贷专区', '产品曝光', 'CPBG0005', channelVersion, '', '', channelCode, itemI.productId, lastestStorageUserId, '', entry.target.dataset.id, '', '', '', '', new Date().getTime());
                });
              }
            });
          }
        }
        ele.push(entry.target.dataset.id);
      }
    });
  };
};

