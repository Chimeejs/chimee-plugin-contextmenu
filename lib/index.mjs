
/**
 * chimee-plugin-contextmenu v0.0.6
 * (c) 2017 huzunjie
 * Released under ISC
 */

function __$styleInject(css, returnValue) {
  if (typeof document === 'undefined') {
    return returnValue;
  }
  css = css || '';
  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';
  if (style.styleSheet){
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
  head.appendChild(style);
  return returnValue;
}

import popupFactory from 'chimee-plugin-popup';
import { isArray, isFunction } from 'chimee-helper';

__$styleInject("chimee-menu{position:absolute;color:#fff;background-color:rgba(37,37,37,.7);font-size:13px;font-family:sans-serif;border:1px solid hsla(0,0%,100%,.08);border-radius:2px;padding:2px;box-shadow:0 1px 4px rgba(0,0,0,.6)}chimee-menu ul{margin:0;padding:0;font-size:12px}chimee-menu li{cursor:pointer;padding:0 4px;line-height:24px;list-style:none;white-space:nowrap;margin:0;border:0;font-size:12px;font-weight:400}chimee-menu li:hover{background-color:hsla(0,0%,100%,.1)}chimee-menu li[disable]{opacity:.5;cursor:default}", undefined);

var logPopupOpenEvt = 'openLogPopup';
/* 右键菜单插件
 * 接收参数：baseMenus, menus
 * 也可通过方法 updatemenu 更新自定义菜单项
 */
var index = popupFactory({
  tagName: 'chimee-menu',
  name: 'chimeeContextmenu',
  html: '<ul></ul>',
  offset: '0',
  hide: true,
  data: {
    // 默认菜单项
    baseMenus: [{
      text: '查看日志',
      action: logPopupOpenEvt,
      hide: true
    }, {
      text: 'copyright 360 vs: {VERSION}',
      disable: true
    }, {
      text: '关闭',
      className: '_close'
    }]
  },
  create: function create() {
    var _$config = this.$config,
        baseMenus = _$config.baseMenus,
        menus = _$config.menus;

    if (isArray(baseMenus)) {
      this.baseMenus = baseMenus;
    }
    this.updatemenu(menus);
    this.$domWrap.on('click', this.clickHandler);
  },
  opened: function opened() {
    // 盖住所有插件
    this.$bumpToTop();
  },

  events: {
    contextmenu: function contextmenu(e) {
      var left = e.offsetX;
      var top = e.offsetY;
      var containerEl = this.$dom.parentElement;
      if (isFunction(containerEl.getBoundingClientRect)) {
        var rect = containerEl.getBoundingClientRect();
        left = e.pageX - rect.left - (document.documentElement.scrollLeft || document.body.scrollLeft || 0);
        top = e.pageY - rect.top - (document.documentElement.scrollTop || document.body.scrollTop || 0);
      }
      this.offset(left + 'px ' + top + 'px').open(e);
      e.preventDefault();
    },
    mousedown: function mousedown(e) {
      e.button !== 2 && this.close(e);
    },

    // 当日志插件卸载时隐藏“查看日志”菜单项
    logPluginDestroy: function logPluginDestroy() {
      this.switchLogMenu(true);
    },

    // 当日志插件状态完毕显示“查看日志”菜单项
    logPluginCreate: function logPluginCreate() {
      this.switchLogMenu(false);
    }
  },
  methods: {
    switchLogMenu: function switchLogMenu(hide) {
      var logMenuConf = this.baseMenus.find(function (item) {
        return item.action === logPopupOpenEvt;
      });
      if (logMenuConf) {
        logMenuConf.hide = hide;
        this.$domWrap.find('[data-action="' + logPopupOpenEvt + '"]').css('display', hide ? 'none' : '');
      }
    },
    updatemenu: function updatemenu(menusConfig) {
      var _this = this;

      var menus = [];
      if (isArray(menusConfig)) {
        menus = menus.concat(menusConfig);
      }
      // console.log(this.$plugins.chimeeLog);
      var meunsHTML = menus.concat(this.baseMenus).map(function (_ref) {
        var hide = _ref.hide,
            disable = _ref.disable,
            action = _ref.action,
            className = _ref.className,
            text = _ref.text;
        return '\n        <li\n         ' + (disable ? ' disable' : '') + '\n         ' + (action ? ' data-action="' + action + '"' : '') + '\n         ' + (className ? ' class="' + className + '"' : '') + '\n         ' + (hide ? ' style="display:none"' : '') + '\n        >' + text.replace(/\{([^)]*)\}/g, function (_, matchStr) {
          return _this[matchStr];
        }) + '</li>\n      ';
      }).join('');
      this.$domWrap.find('ul').html(meunsHTML);
    },
    clickHandler: function clickHandler(e) {
      var el = e.target;
      if (!el.disable) {
        var act = el.dataset.action;
        if (act) {
          // 抛出右键项点击对应事件给全局
          this.$emit(act);
          isFunction(this[act]) && this[act](e);
        }
        this.close();
      }
      e.stopPropagation();
    }
  }
});

export default index;
