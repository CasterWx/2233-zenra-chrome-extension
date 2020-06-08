(function(){
  'use strict';

  var script = document.createElement("script");
  script.type = "text/javascript";

  script.onload = function(){
      //监听DOM树变化
      var observeDOMChanges = (function(){
          var flag = true;
          var ts = Date.now();

          // 对变化的 dom 的操作
          var changedHandler = function (element) {
              if(flag && document.querySelectorAll('canvas.haruna-canvas').length > 0){
                  console.log('发现2233，开始替换');

                  //插旗
                  flag = false;

                  //移除原有的画布
                  var canvas = document.querySelectorAll('canvas.haruna-canvas')[0];
                  var parent = canvas.parentElement;
                  parent.removeChild(canvas);

                  //然后新建一个
                  var newcanvas = document.createElement('canvas');
                  newcanvas.id = 'live2d';
                  newcanvas.className = 'haruna-canvas';
                  newcanvas.width = 440;
                  newcanvas.height = 500;
                  //宽高样式设为画布的一半 优化高分屏显示效果
                  newcanvas.style.width = '220px';
                  newcanvas.style.height = '250px';
                  parent.insertBefore(newcanvas, parent.firstChild);

                  //看看是22还是33
                  var type = '22';
                  $.ajax({
                      type: "GET",
                      url: String.format('https://api.live.bilibili.com/live/getRoomKanBanModel?roomid={0}', BilibiliLive.ROOMID),
                      async: false,
                      success : function(data) {
                          type = data.label || type;
                      }
                  });

                  var jsonUrl = String.format('https://api.imjad.cn/interface/live2d/{0}/{0}.zenra{1}.json?v1', type, (window.devicePixelRatio > 1 ? '@2x' : ''));

                  //加载没穿衣服的2233
                  loadlive2d("live2d", jsonUrl);

                  //使其支持拖动
                  var _move = false;
                  var ismove = false;
                  var _x, _y;
                  $(".live-haruna-ctnr").mousedown(function(e){
                      _move = true;
                      _x = e.pageX-parseInt($(".live-haruna-ctnr").css("left"));
                      _y = e.pageY-parseInt($(".live-haruna-ctnr").css("top"));
                  });
                  $(document).mousemove(function(e){
                      if(_move){
                          var x = e.pageX-_x;
                          var y = e.pageY-_y;
                          var wx = $(window).width()-$('.live-haruna-ctnr').width();
                          var dy = $(document).height()-$('.live-haruna-ctnr').height();
                          if(x>=0&&x<=wx&&y>0&&y<=dy){
                              $(".live-haruna-ctnr").css({
                                  top:y,
                                  left:x
                              });
                              ismove = true;
                          }
                      }
                  }).mouseup(function(){
                      _move = false;
                  });

                  //点击说话
                  $("#live2d").click(function(){
                      var msgs = ["你要干嘛呀？","鼠…鼠标放错地方了！","喵喵喵？","萝莉控是什么呀？","怕怕","你看到我的小熊了吗"];
                      var i = Math.floor(Math.random() * msgs.length);
                      showMessage(msgs[i]);
                  });

                  //移除事件监听
                  observer.disconnect();
                  document.removeEventListener("DOMSubtreeModified", changedHandler, false);

                  console.log('没穿衣服的2233替换完成');
              }

              if(Date.now() - ts >= 30 * 1000){
                  flag = false;
                  observer.disconnect();
                  document.removeEventListener("DOMSubtreeModified", changedHandler, false);

                  console.log('超时');
              }
          };
          // 检查 MutationObserver 浏览器兼容
          var MutationObserver = window.MutationObserver ||
                                 window.WebKitMutationObserver ||
                                 window.MozMutationObserver;
          if (MutationObserver) {
              // MutationObserver 配置
              var MutationObserverConfig = {
                  // 监听子节点
                  childList: true,
                  // 监听 href 属性
                  attributes: true,
                  // 监听整棵树
                  subtree: true
              };
              // 监听器
              var observer = new MutationObserver(function (mutations) {
                  mutations.forEach(function (mutation) {
                      // 处理 变化的 DOM
                      changedHandler(mutation.target);
                      // 处理 新增的 DOM
                      if (mutation.addedNodes) {
                          mutation.addedNodes.forEach(changedHandler);
                      }
                      // 删除的 DOM 无需处理 (mutation.removedNodes)
                  });
              });
              return function () {
                  // 开始监听
                  observer.observe(document.body, MutationObserverConfig);
              };
          } else if (document.body.addEventListener) {
              // addEventListener 和 Mutation events 都是 IE 9 以上才支持
              var bindMutationEvents = function (eventName) {
                  document.body.addEventListener(eventName, function (e) {
                      changedHandler(e.target);
                  });
              };
              var binded = false;
              return function () {
                  if (binded) {
                      return;
                  }
                  binded = true;
                  bindMutationEvents('DOMSubtreeModified');
                  bindMutationEvents('DOMNodeInserted');
              };
          } else {
              // IE 8- 就不管了
              return function () {
                  console.log('MutationObserver not support!');
              };
          }
      })();
      observeDOMChanges();
  };

  //加载库文件
  script.src = "https://api.imjad.cn/interface/live2d/live2d.js?v=1.1.5";
  document.body.appendChild(script);

  //封装一些方法
  String.format = function(src){
      if (arguments.length == 0) return null;
      var args = Array.prototype.slice.call(arguments, 1);
      return src.replace(/\{(\d+)\}/g, function(m, i){
          return args[i];
      });
  };

  function showMessage(a,b){
      if(b === null) b = 10000;
      $(".base-bubble,.speaking-bubble,.bubble-item").hide().stop();
      $(".speaking-bubble").html(a);
      $(".base-bubble,.speaking-bubble,.bubble-item").fadeTo("10",1);
      $(".base-bubble,.speaking-bubble,.bubble-item").fadeOut(b);
  }
})();