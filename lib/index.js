
/** chimeePluginContextmenu
 * chimee-plugin-contextmenu v0.1.2
 * (c) 2017 huzunjie
 * Released under ISC
 */

'use strict';

function __$styleInject(css, returnValue) {
  if (typeof document === 'undefined') {
    return returnValue;
  }
  css = css || '';
  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';
  head.appendChild(style);
  
  if (style.styleSheet){
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
  return returnValue;
}

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var popupFactory = _interopDefault(require('chimee-plugin-popup'));
var chimeeHelper = require('chimee-helper');

__$styleInject("chimee-menu{position:absolute;color:#fff;background-color:rgba(37,37,37,.7);font-size:13px;font-family:sans-serif;border:1px solid hsla(0,0%,100%,.08);border-radius:2px;padding:2px;box-shadow:0 1px 4px rgba(0,0,0,.6)}chimee-menu ul{margin:0;padding:0;font-size:12px}chimee-menu li{cursor:pointer;padding:0 4px;line-height:24px;list-style:none;white-space:nowrap;margin:0;border:0;font-size:12px;font-weight:400}chimee-menu li:hover{background-color:hsla(0,0%,100%,.1)}chimee-menu li[disable]{opacity:.5;cursor:default}chimee-menu li a{color:#fff;text-decoration:none}chimee-menu li a:hover{color:#fff}", undefined);

var logPopupOpenEvt = 'openLogPopup';
/* 右键菜单插件
 * 接收参数：baseMenus, menus
 * 也可通过方法 updatemenu 更新自定义菜单项
 */
var contextmenuConf = popupFactory({
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
      text: 'Chimee {VERSION} &copy; 360',
      url: 'http://chimee.org',
      disable: true /* ,
                    {
                     text: '关闭',
                     className: '_close'
                    }*/
    }]
  },
  create: function create() {
    var _this = this;

    var _$config = this.$config,
        baseMenus = _$config.baseMenus,
        menus = _$config.menus;

    if (chimeeHelper.isArray(baseMenus)) {
      this.baseMenus = baseMenus;
    }
    this.updatemenu(menus);
    this.$domWrap.on('click', this.clickHandler);
    // 如果已装载日志插件，则显示相应菜单项
    if (this.$plugins.chimeeLog) {
      this.switchLogMenu(false);
    }
    // 点击播放器之外的文档区域关闭右键菜单
    this._doc = new this.$domWrap.constructor(document);
    this._doc_click = function (e) {
      return _this.close();
    };
    this._doc.on('click', this._doc_click);
  },
  destroy: function destroy() {
    this._doc.off('click', this._doc_click);
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
      if (chimeeHelper.isFunction(containerEl.getBoundingClientRect)) {
        var rect = containerEl.getBoundingClientRect();
        left = e.pageX - rect.left - (document.documentElement.scrollLeft || document.body.scrollLeft || 0);
        top = e.pageY - rect.top - (document.documentElement.scrollTop || document.body.scrollTop || 0);
      }
      this.offset(left + 'px ' + top + 'px').open(e);
      e.preventDefault();
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
      var _this2 = this;

      var menus = [];
      if (chimeeHelper.isArray(menusConfig)) {
        menus = menus.concat(menusConfig);
      }
      // 菜单模板编译
      var meunsHTML = menus.concat(this.baseMenus).map(function (_ref) {
        var hide = _ref.hide,
            disable = _ref.disable,
            action = _ref.action,
            className = _ref.className,
            text = _ref.text,
            url = _ref.url;

        var attrDis = disable ? 'disable' : '';
        var dataAct = action ? 'data-action="' + action + '"' : '';
        var clsAttr = className ? 'class="' + className + '"' : '';
        var hideSty = hide ? 'style="display:none"' : '';
        // 文本替换，使之支持 {VERSION} 的变量写法
        var innText = text.replace(/\{([^)]*)\}/g, function (_, matchStr) {
          return _this2[matchStr];
        });
        if (url) {
          innText = '<a href="' + url + '" target="_blank">' + innText + '</a>';
        }
        return '<li ' + attrDis + ' ' + dataAct + ' ' + clsAttr + ' ' + hideSty + '>' + innText + '</li>';
      }).join('');

      // 输出菜单DOM
      this.$domWrap.find('ul').html(meunsHTML);
    },
    clickHandler: function clickHandler(e) {
      var el = e.target;
      if (!el.disable) {
        var act = el.dataset.action;
        if (act) {
          // 抛出右键项点击对应事件给全局
          this.$emit(act);
          chimeeHelper.isFunction(this[act]) && this[act](e);
        }
        this.close();
      }
      e.stopPropagation();
    }
  }
});

module.exports = contextmenuConf;
