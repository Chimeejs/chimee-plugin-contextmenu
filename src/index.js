import popupFactory from 'chimee-plugin-popup';
import {isFunction, isArray} from 'chimee-helper';

import './index.css';

const logPopupOpenEvt = 'openLogPopup';
/* 右键菜单插件
 * 接收参数：baseMenus, menus
 * 也可通过方法 updatemenu 更新自定义菜单项
 */
const contextmenuConf = popupFactory({
  tagName: 'chimee-menu',
  name: 'chimeeContextmenu',
  html: '<ul></ul>',
  offset: '0',
  hide: true,
  data: {
    // 默认菜单项
    baseMenus: [
      {
        text: '查看日志',
        action: logPopupOpenEvt,
        hide: true
      },
      {
        text: 'Chimee {VERSION} &copy; 360',
        url: 'http://chimee.org',
        disable: true
      }/* ,
      {
        text: '关闭',
        className: '_close'
      }*/
    ]
  },
  create () {
    const {baseMenus, menus} = this.$config;
    if(isArray(baseMenus)) {
      this.baseMenus = baseMenus;
    }
    this.updatemenu(menus);
    this.$domWrap.on('click', this.clickHandler);
    // 如果已装载日志插件，则显示相应菜单项
    if(this.$plugins.chimeeLog) {
      this.switchLogMenu(false);
    }
    // 点击播放器之外的文档区域关闭右键菜单
    this._doc = new this.$domWrap.constructor(document);
    this._doc_click = e => this.close();
    this._doc.on('click', this._doc_click);
  },
  destroy () {
    this._doc.off('click', this._doc_click);
  },
  opened () {
    // 盖住所有插件
    this.$bumpToTop();
  },
  events: {
    contextmenu (e) {
      let left = e.offsetX;
      let top = e.offsetY;
      const containerEl = this.$dom.parentElement;
      if (isFunction(containerEl.getBoundingClientRect)) {
        const rect = containerEl.getBoundingClientRect();
        left = e.pageX - rect.left - (document.documentElement.scrollLeft || document.body.scrollLeft || 0);
        top = e.pageY - rect.top - (document.documentElement.scrollTop || document.body.scrollTop || 0);
      }
      this.offset(left + 'px ' + top + 'px').open(e);
      e.preventDefault();
    },
    // 当日志插件卸载时隐藏“查看日志”菜单项
    logPluginDestroy () {
      this.switchLogMenu(true);
    },
    // 当日志插件状态完毕显示“查看日志”菜单项
    logPluginCreate () {
      this.switchLogMenu(false);
    }
  },
  methods: {
    switchLogMenu (hide) {
      const logMenuConf = this.baseMenus.find(item => item.action === logPopupOpenEvt);
      if(logMenuConf) {
        logMenuConf.hide = hide;
        this.$domWrap.find('[data-action="' + logPopupOpenEvt + '"]').css('display', hide ? 'none' : '');
      }
    },
    updatemenu (menusConfig) {
      let menus = [];
      if (isArray(menusConfig)) {
        menus = menus.concat(menusConfig);
      }
      // 菜单模板编译
      const meunsHTML = menus.concat(this.baseMenus).map(({hide, disable, action, className, text, url}) => {
        const attrDis = disable ? 'disable' : '';
        const dataAct = action ? 'data-action="' + action + '"' : '';
        const clsAttr = className ? 'class="' + className + '"' : '';
        const hideSty = hide ? 'style="display:none"' : '';
        // 文本替换，使之支持 {VERSION} 的变量写法
        let innText = text.replace(/\{([^)]*)\}/g, (_, matchStr) => this[matchStr]);
        if(url) {
          innText = `<a href="${url}" target="_blank">${innText}</a>`;
        }
        return `<li ${attrDis} ${dataAct} ${clsAttr} ${hideSty}>${innText}</li>`;
      }).join('');

      // 输出菜单DOM
      this.$domWrap.find('ul').html(meunsHTML);
    },
    clickHandler (e) {
      const el = e.target;
      if (!el.disable) {
        const act = el.dataset.action;
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

export default contextmenuConf;
