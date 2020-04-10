const appid = "";
const key = "";
if (CC_EDITOR) {
  if (!Editor.CocosService_gmeDemo) {
    Editor.CocosService_gmeDemo = true;
    Editor.log("欢迎使用腾讯云 GME 游戏多媒体引擎服务！");
    Editor.log(
      "这是一个简单的 GME 示例 Demo，通过本示例您可以快速了解如何使用 GME 来实现游戏语音功能！"
    );
  }
  if (appid === "" || key === "") {
    Editor.log(
      "您需要首先从右侧的服务面板开启 腾讯云GME 服务，然后从 腾讯云GME 服务面板前往腾讯云控制台获取 SDK 初始化参数并填写到示例代码中的相关位置，以使 Demo 能够运行。"
    );
    Editor.log("初始化参数所在位置：assets/Script/index.js 文件最顶部");
  }
}
cc.Class({
  extends: cc.Component,

  properties: {
    langLabelSetup1: {
      default: null,
      type: cc.Label
    },
    langLabelSetup1BtnLabel: {
      default: null,
      type: cc.Label
    },
    langLabelSetup2: {
      default: null,
      type: cc.Label
    },
    langLabelSetup2PlaceHolder: {
      default: null,
      type: cc.Label
    },
    langLabelSetup2BtnLabel: {
      default: null,
      type: cc.Label
    },
    langLabelSetup3: {
      default: null,
      type: cc.Label
    },
    btnInit: {
      default: null,
      type: cc.Button
    },
    btnJoin: {
      default: null,
      type: cc.Button
    },
    btnLocal: {
      default: null,
      type: cc.Button
    },
    btnRemote: {
      default: null,
      type: cc.Button
    },
    btnCNLang: {
      default: null,
      type: cc.Button
    },
    btnENLang: {
      default: null,
      type: cc.Button
    },
    ebChannel: {
      default: null,
      type: cc.EditBox
    },
    logListView: {
      default: null,
      type: cc.ScrollView
    },
    localSprite: {
      default: null,
      type: cc.Sprite
    },
    disableLocalSprite: {
      default: null,
      type: cc.Sprite
    },
    remoteSprite: {
      default: null,
      type: cc.Sprite
    },
    disableRemoteSprite: {
      default: null,
      type: cc.Sprite
    },
    itemTemplate: {
      default: null,
      type: cc.Node
    },
    joined: false,
    lang: "zh",
    speakerEnabled: false,
    micEnabled: false,
    logs: []
  },

  // use this for initialization
  onLoad: function() {
    this.initGMEEvents();
    this.btnInit.interactable = true;
    this.btnJoin.interactable = false;
    this.btnLocal.interactable = false;
    this.btnRemote.interactable = false;
    this.lang = cc.sys.language;
    this.initMultiLang();
    this.updateMute();
  },

  initGMEEvents: function() {
    if (tencentGME) {
      tencentGME.on("event", this.onEvent, this);
    }
  },

  onDestroy: function() {
    this.uninitGMEEvents();
  },

  uninitGMEEvents: function() {
    if (tencentGME) {
      tencentGME.off("event", this.onEvent);
    }
  },

  initMultiLang: function() {
    if (this.lang === cc.sys.LANGUAGE_CHINESE) {
      this.langLabelSetup1.string = "步骤1：初始化 GME";
      this.langLabelSetup1BtnLabel.string = "初始化";
      this.langLabelSetup2.string = "步骤2：加入房间";
      this.langLabelSetup2PlaceHolder.string = "能标识房间的房间名(任意)";
      this.langLabelSetup2BtnLabel.string = this.joined ? "离开" : "加入";
      this.langLabelSetup3.string = "步骤3：发布和订阅流";
      this.btnCNLang.interactable = false;
      this.btnENLang.interactable = true;
    } else if (this.lang === cc.sys.LANGUAGE_ENGLISH) {
      this.langLabelSetup1.string = "Step 1: Initialize GME";
      this.langLabelSetup1BtnLabel.string = "Initialize";
      this.langLabelSetup2.string = "Step 2: Join the Room";
      this.langLabelSetup2PlaceHolder.string = "Room (Unique room name)";
      this.langLabelSetup2BtnLabel.string = this.joined ? "Leave" : "Join";
      this.langLabelSetup3.string = "Step 3: Publish or subscribe";
      this.btnCNLang.interactable = true;
      this.btnENLang.interactable = false;
    }
  },

  initGME: function() {
    if (appid === "" || key === "") {
      this.printLog("please input AppID or key!");
      return;
    }
    var openid = "" + parseInt(Math.random() * 100000);
    tencentGME && tencentGME.init(appid, key, openid);
    this.printLog("init tencentGME, appid:" + appid);
    this.printCode(
      `tencentGME && tencentGME.init('${appid}', '${key}', '${openid}');`
    );
    this.btnInit.interactable = false;
    this.btnJoin.interactable = true;
  },

  joinRoom: function() {
    if (this.joined) {
      tencentGME && tencentGME.exitRoom();
      this.printCode(`tencentGME && tencentGME.exitRoom();`);
    } else {
      var channel = this.ebChannel.string;
      if (channel === "") {
        this.printLog("please input channel!");
        return;
      }
      tencentGME && tencentGME.enterRoom(channel, 1);
      this.printCode(`tencentGME && tencentGME.enterRoom('${channel}', 1);`);
    }
  },

  updateMute: function() {
    this.localSprite.node.active = this.micEnabled;
    this.disableLocalSprite.node.active = !this.micEnabled;
    this.remoteSprite.node.active = this.speakerEnabled;
    this.disableRemoteSprite.node.active = !this.speakerEnabled;
  },

  btnLocalStream: function() {
    this.micEnabled = !this.micEnabled;
    this.updateMute();
    tencentGME && tencentGME.enableMic(this.micEnabled);
    this.printLog("Enable Mic" + this.micEnabled ? "mute" : "unmute");
    this.printCode(`tencentGME && tencentGME.enableMic(${this.micEnabled});`);
  },

  btnRemoteStream: function() {
    this.speakerEnabled = !this.speakerEnabled;
    this.updateMute();
    tencentGME && tencentGME.enableSpeaker(this.speakerEnabled);
    this.printLog("Enable Speaker" + this.speakerEnabled ? "mute" : "unmute");
    this.printCode(
      `tencentGME && tencentGME.enableSpeaker(${this.speakerEnabled});`
    );
  },

  switchLangCN: function() {
    this.lang = cc.sys.LANGUAGE_CHINESE;
    this.initMultiLang();
  },

  switchLangEN: function() {
    this.lang = cc.sys.LANGUAGE_ENGLISH;
    this.initMultiLang();
  },

  exitBtnClick: function() {
    if (cc.sys.isBrowser) {
      cc.game.restart();
    } else if (cc.sys.isNative) {
      cc.game.end();
    }
  },

  printCode: function(code) {
    this.printLog("   ");
    this.printLog("---------- Sample code start ----------");
    this.printLog(code);
    this.printLog("---------- Sample code end   ----------");
    this.printLog("   ");
  },

  printLog: function(info) {
    if (this.logs.length > 50) {
      this.logs = [];
      this.logListView.content.removeAllChildren(true);
    }
    this.logs.push(info);
    var item = cc.instantiate(this.itemTemplate);
    this.logListView.content.addChild(item);
    item.getComponent("Item").updateItem(info);
    this.logListView.scrollToBottom(0.1);
  },

  onEvent: function(eventType, result) {
    switch (eventType) {
      case tencentGME.event.ITMG_MAIN_EVENT_TYPE_ENTER_ROOM:
        console.log("ITMG_MAIN_EVENT_TYPE_ENTER_ROOM");
        console.log(JSON.stringify(result));
        if (result.result === 0) {
          this.btnLocal.interactable = true;
          this.btnRemote.interactable = true;
          this.joined = true;
          this.speakerEnabled = false;
          this.micEnabled = false;
          tencentGME && tencentGME.enableSpeaker(this.speakerEnabled);
          tencentGME && tencentGME.enableMic(this.micEnabled);
          this.initMultiLang();
          this.updateMute();
        } else {
          this.printCode("Join Room failed: " + result.error_info);
        }
        break;
      case tencentGME.event.ITMG_MAIN_EVENT_TYPE_EXIT_ROOM:
        console.log("ITMG_MAIN_EVENT_TYPE_EXIT_ROOM");
        console.log(JSON.stringify(result));
        if (result.result === 0) {
          this.btnLocal.interactable = false;
          this.btnRemote.interactable = false;
          this.joined = false;
          this.speakerEnabled = false;
          this.micEnabled = false;
          tencentGME && tencentGME.enableSpeaker(this.speakerEnabled);
          tencentGME && tencentGME.enableMic(this.micEnabled);
          this.initMultiLang();
          this.updateMute();
        } else {
          this.printCode("Leave Room failed: " + result.error_info);
        }
        break;
      case tencentGME.event.ITMG_MAIN_EVENT_TYPE_ROOM_DISCONNECT:
        console.log("ITMG_MAIN_EVENT_TYPE_ROOM_DISCONNECT");
        console.log(JSON.stringify(result));
        break;
      case tencentGME.event.ITMG_MAIN_EVNET_TYPE_USER_UPDATE:
        console.log("ITMG_MAIN_EVNET_TYPE_USER_UPDATE");
        console.log(JSON.stringify(result));
        break;
    }
  },

  // called every frame
  update: function(dt) {}
});
