Chimee.install(chimeePluginControlbar);
Chimee.install(chimeePluginLog);
Chimee.install(chimeePluginContextmenu);

const player = new Chimee({
  // 业务标识
  business_id:'livecloud',

  // 播放地址
  src: 'http://cdn.toxicjohann.com/lostStar.mp4',
  // 直播:live 点播：vod
  isLive: false,
  // 编解码容器
  box: 'native',
  // dom容器
  wrapper: '#wrapper',
  plugin: [chimeePluginControlbar.name, chimeePluginLog.name, chimeePluginContextmenu.name],
  // video
  autoplay: true,
  controls: true
});
