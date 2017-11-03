import chimeeContextmenu from 'index';
import {$} from 'chimee-helper';

// 模拟构造
const $domWrap = $('<chimee-menu>').append($('<ul></ul>')).appendTo('body');
const $dom = $domWrap[0];
Object.assign(
  chimeeContextmenu,
  {
    $domWrap,
    $dom,
    $config: {
    },
    $plugins: {},
    _emit: {},
    $emit (act) {
      this._emit[act] = (this._emit[act] || 0) + 1;
    },
    $bumpToTop () {}
  },
  chimeeContextmenu.methods,
  chimeeContextmenu.data
);

test('create', () => {
  chimeeContextmenu.create();

  expect(chimeeContextmenu.name).toBe('chimeeContextmenu');

  const baseMenusCount = chimeeContextmenu.data.baseMenus.length;
  expect(chimeeContextmenu.baseMenus).toHaveLength(baseMenusCount);
  expect($domWrap.find('li')).toHaveLength(baseMenusCount);

  chimeeContextmenu.$config.baseMenus = chimeeContextmenu.baseMenus.concat([{
    text: 'txt_base', action: 'txt_base'
  }]);
  chimeeContextmenu.create();
  expect($domWrap.find('li[data-action="txt_base"]')).toHaveLength(1);
});

test('clickHandler', done => {
  // 测试菜单点击事件绑定
  const _clickHandler = chimeeContextmenu.clickHandler;
  chimeeContextmenu.clickHandler = function (e) {
    expect(e.target.tagName).toBe('LI');
    done();
  };
  chimeeContextmenu.create();
  $domWrap.find('li')[0].click();
  chimeeContextmenu.clickHandler = _clickHandler;

  // 菜单项 disable 状态
  chimeeContextmenu.clickHandler({
    target: {
      disable: true
    },
    stopPropagation () {}
  });

  // 模拟正常状态
  let _act_run = 0;
  chimeeContextmenu.openLogPopup = e => {
    _act_run = 1;
  };
  let _stopPropagation_run = 0;
  chimeeContextmenu.clickHandler({
    target: {
      disable: false,
      dataset: {
        action: 'openLogPopup'
      }
    },
    stopPropagation () {
      _stopPropagation_run++;
    }
  });
  expect(chimeeContextmenu._emit.openLogPopup).toBe(1);
  expect(_act_run).toBe(1);
  expect(_stopPropagation_run).toBe(1);

  // action对应 method 不存在的情况
  chimeeContextmenu.clickHandler({
    target: {
      disable: false,
      dataset: {
        action: undefined
      }
    },
    stopPropagation () {
      _stopPropagation_run++;
    }
  });
  expect(_stopPropagation_run).toBe(2);
});

test('updatemenu', () => {
  chimeeContextmenu.updatemenu([
    { text: 'txt1', action: 'act1' },
    { text: 'txt2', action: 'act2' }
  ]);
  expect(chimeeContextmenu.$domWrap.find('[data-action="act1"]')).toHaveLength(1);
  expect(chimeeContextmenu.$domWrap.find('[data-action="act2"]')).toHaveLength(1);
});

test('switchLogMenu', () => {
  // “查看日志”菜单项显示隐藏
  chimeeContextmenu.events.logPluginDestroy.call(chimeeContextmenu);
  expect(chimeeContextmenu.$domWrap.find('[data-action="openLogPopup"]').css('display')).toBe('none');
  chimeeContextmenu.events.logPluginCreate.call(chimeeContextmenu);
  expect(chimeeContextmenu.$domWrap.find('[data-action="openLogPopup"]').css('display')).not.toBe('none');

  // “查看日志”菜单项不存在的情况
  chimeeContextmenu.baseMenus = [];
  chimeeContextmenu.updatemenu([]);
  chimeeContextmenu.switchLogMenu(true);
  expect(chimeeContextmenu.$domWrap.find('[data-action="openLogPopup"]')).toHaveLength(0);
  chimeeContextmenu.baseMenus = chimeeContextmenu.data.baseMenus;
});


test('events.contextmenu', () => {
  /* 
  this.offset(e.offsetX + 'px ' + e.offsetY + 'px').open(e);
  e.preventDefault();
  */
  expect(chimeeContextmenu._hide).toBe(true);
  let _stop_run = 0;
  chimeeContextmenu.events.contextmenu.call(chimeeContextmenu, {
    offsetX: 0,
    offsetY: 0,
    preventDefault () { _stop_run++; }
  });
  expect(_stop_run).toBe(1);
  expect(chimeeContextmenu._hide).toBe(false);
});
