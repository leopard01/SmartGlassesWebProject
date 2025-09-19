<template>
  <div class="home-container">
    <!-- <h1>小程序H5通信示例</h1>

    <h3>URL通信方式（推荐）</h3>
    <button @click="sendMessageByUrl('button_clicked')">
      点击我 - URL方式
    </button>
    <button @click="sendJsonMessageByUrl({type: 'startSearch'})">
      开始搜索设备 - URL方式
    </button>

    <h3>postMessage方式（备用）</h3>
    <button @click="sendMessageByPostMessage('button_clicked')">
      点击我 - postMessage方式
    </button>

    <div class="info">
      <p>💡 <strong>URL通信方式优点：</strong></p>
      <ul>
        <li>实时性更好，小程序能立即接收到消息</li>
        <li>可靠性更高，不受微信postMessage机制限制</li>
        <li>适用于需要即时响应的场景</li>
      </ul>
      <p>
        🔧
        <strong>实现原理：</strong
        >通过修改页面URL（添加消息参数），触发小程序web-view的bindload事件，小程序解析URL中的消息并处理。
      </p>
    </div> -->
    <div
      class="open-btn"
      v-if="!isConnect"
      @click="sendMessageByUrl('openBluetoothSettings')"
    >
      打开蓝牙设置
    </div>
    <div class="open-btn" v-else>智能眼镜型号</div>
    <div class="glass-box">
      <img src="../assets/images/glass-photo.png" class="glass-photo" alt="" />
      <div v-if="!isConnect">
        <div class="glass-tips">设备未连接</div>
        <div class="glass-tips">请在手机蓝牙设置中连接智能眼镜</div>
        <div class="add-glass-btn" @click="sendMessageByUrl('startSearch')">
          <img class="add-icon" src="../assets/images/add.png" alt="" />
          <span>添加设备</span>
        </div>
      </div>
      <div v-else>
        <div class="connect-box">
          <img
            src="../assets/images/bluetooth.png"
            class="bluetooth-icon"
            alt=""
          />
          <div>设备已连接</div>
        </div>
        <div class="disconnect-btn" @click="disconnectBtn">断开连接</div>
      </div>
    </div>
    <!-- 发现的设备列表 -->
    <div class="discover-box" v-if="!isConnect">
      <div class="discover-title">发现的设备</div>
      <div>
        <div class="discover-item">
          <div class="discover-name">Zzz01</div>
          <div class="discover-id">0a32ee0d-3e91-58b1-15b7-e1fb563e39d3</div>
          <div class="discover-btn">点击连接</div>
        </div>
        <div class="discover-item">
          <div class="discover-name">Zzz01</div>
          <div class="discover-id">0a32ee0d-3e91-58b1-15b7-e1fb563e39d3</div>
          <div class="discover-btn">点击连接</div>
        </div>
        <div class="discover-item">
          <div class="discover-name">Zzz01</div>
          <div class="discover-id">0a32ee0d-3e91-58b1-15b7-e1fb563e39d3</div>
          <div class="discover-btn">点击连接</div>
        </div>
      </div>
    </div>
    <!-- 已连接设备信息 -->
    <div v-else class="connect-info">
      <!-- 电量信息 -->
      <div class="battery-info">
        <div class="battery-box">
          <span>剩余电量</span>
          <img class="battery-icon" src="../assets/images/battery.png" alt="" />
        </div>
        <div class="battery-percent">
          <div class="left-battery">
            <div class="left-battery-box">
              <span class="left-battery-text">L</span>
              <span class="left-battery-time">5小时30分钟</span>
            </div>
            <div class="battery-line-box">
              <div class="battery-line">
                <div class="battery-line-fill"></div>
              </div>
              <div class="battery-line-text">50%</div>
            </div>
          </div>
          <div class="right-battery">
            <div class="right-battery-box">
              <span class="right-battery-text">R</span>
              <span class="right-battery-time">7小时20分钟</span>
            </div>
            <div class="battery-line-box">
              <div class="battery-line">
                <div class="battery-line-fill"></div>
              </div>
              <div class="battery-line-text">50%</div>
            </div>
          </div>
        </div>
      </div>
      <!-- 音量信息 -->
      <div class="volume-info">
        <div class="volume-box">
          <span>音量</span>
          <img class="volume-icon" src="../assets/images/volume2.png" alt="" />
        </div>
        <div class="volume-bar-box">
          <img class="volume-icon2" src="../assets/images/volume.png" alt="" />
          <div class="volume-line">
            <div class="volume-line-fill"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="brand-name">Silicon AI</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Bridge from "./bridge";
import axios from "axios";
import wx from "weixin-js-sdk";

const wxInstance = wx || window.wx;

let isConnect = ref(false);
// 添加一个JavaScript原生toast函数作为回退
function showNativeToast(message, duration = 2000) {
  // 检查是否已经存在toast元素
  let toast = document.getElementById("native-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "native-toast";
    toast.style.position = "fixed";
    toast.style.top = "50%";
    toast.style.left = "50%";
    toast.style.transform = "translate(-50%, -50%)";
    toast.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    toast.style.color = "white";
    toast.style.padding = "10px 15px";
    toast.style.borderRadius = "5px";
    toast.style.zIndex = "9999";
    toast.style.fontSize = "14px";
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.style.display = "block";

  setTimeout(() => {
    toast.style.display = "none";
  }, duration);
}
async function initWx() {
  console.log("===== initWx函数开始执行 ====");

  // 检查wx对象
  console.log(
    "-------12初始化------",
    typeof wx === "undefined" ? "wx未定义" : wx
  );
  console.log(
    "window.wx状态:",
    typeof window.wx === "undefined" ? "未定义" : window.wx
  );

  if (!wx && !window.wx) {
    console.error(
      "错误: 微信SDK未加载，请检查是否在index.html中正确引入了微信SDK的CDN链接"
    );
    return;
  }

  // 统一使用一个wx引用

  // 准备请求参数
  const nonceStr = Math.random().toString(36).substr(2, 15);
  const timestamp = Math.floor(Date.now() / 1000);
  const url = window.location.href.split("#")[0];

  console.log("-------33参数信息------");
  console.log("nonceStr:", nonceStr);
  console.log("timestamp:", timestamp);
  console.log("url:", url);

  // 检查是否在微信环境中运行
  const isWechat = /MicroMessenger/i.test(navigator.userAgent);
  console.log("是否在微信环境中:", isWechat);

  try {
    console.log("开始请求签名接口: https://yb.c-er.com/api/index/mnp_sign");

    // 添加超时设置
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时

    const res = await axios.post(
      "https://yb.c-er.com/api/index/mnp_sign",
      {
        nonceStr,
        timestamp,
        url,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId); // 清除超时计时器

    if (res.status === 200) {
      if (res.data && res.data.code === 1 && res.data.data?.sign) {

        // 使用bridge检查小程序环境
        const isMiniProgram = Bridge.checkMiniProgram();

        wxInstance.config({
          debug: false, // 生产环境关闭调试模式
          appId: "wxb436c2c6a74a67ac",
          timestamp,
          nonceStr,
          signature: res.data.data.sign,
          jsApiList: [
            "checkJsApi",
            "openBluetoothAdapter",
            "startBluetoothDevicesDiscovery",
            "createBLEConnection",
          ],
        });


        // 微信SDK准备就绪回调
        wxInstance.ready(function () {
          try {
            // openBluetoothSettings()
          } catch (toastError) {
            console.warn("showToast调用失败:", toastError);
            showNativeToast("初始化成功", 2000);
          }
        });

        // 微信SDK错误回调 - 专门处理域名错误
        wxInstance.error(function (err) {
          console.error("微信SDK初始化失败:", JSON.stringify(err, null, 2));
        });
      } else {
        console.error("code:", res.data?.code);
        console.error("msg:", res.data?.msg);
      }
    } else {
    }
  } catch (err) {}
}

function handleAddGlass() {
  wx.miniProgram.navigateTo({
    url: "/pages/index/index?type=addGlass",
  });
}
// ...existing code...

const hasPermission = ref(false);
const devices = ref([]);
const notifyData = ref("");
const connectedDevices = ref(new Set());

// 添加重试计数器
let bluetoothPermissionRetryCount = 0;
const MAX_RETRY_COUNT = 2; // 最多重试2次

function checkBluetoothAvailable() {
  console.log("正在检查蓝牙权限检查");

  // 先检查Bridge实例是否可用
  if (!Bridge || typeof Bridge.call !== "function") {
    console.error("Bridge实例不可用或call方法不存在");
    showNativeToast("通信模块未初始化，请刷新页面重试", 2000);
    return;
  }

  // 使用bridge.js提供的call方法来检查蓝牙权限
  Bridge.call("checkBluetoothPermission", {})
    .then((res) => {
      console.log("蓝牙权限检查结果:", res);
      // 重置重试计数器
      bluetoothPermissionRetryCount = 0;

      // 更宽松的判断条件，适应可能的不同返回格式
      if (res && (res.granted || res.success || res.code === 0)) {
        console.log("蓝牙权限已获取，开始扫描设备");
        scanDevices();
      } else {
        console.warn("未获取到蓝牙权限");
        showNativeToast("请授权小程序使用蓝牙功能", 2000);
      }
    })
    .catch((error) => {
      console.error("检查蓝牙权限失败:", error);
      // 提供更详细的错误信息
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      console.error("错误详情:", errorMessage);

      // 根据错误类型显示不同的提示信息
      if (errorMessage.includes("不在小程序环境中")) {
        showNativeToast("请在微信小程序中打开此页面以使用蓝牙功能", 3000);
      } else if (errorMessage.includes("超时")) {
        // 超时错误添加重试机制
        if (bluetoothPermissionRetryCount < MAX_RETRY_COUNT) {
          bluetoothPermissionRetryCount++;
          console.log(
            `蓝牙权限检查超时，第${bluetoothPermissionRetryCount}次重试...`
          );
          showNativeToast(
            `蓝牙权限检查超时，正在重试(${bluetoothPermissionRetryCount}/${MAX_RETRY_COUNT})...`,
            2000
          );

          // 延迟1秒后重试
          setTimeout(() => {
            checkBluetoothAvailable();
          }, 1000);
        } else {
          // 超过最大重试次数
          bluetoothPermissionRetryCount = 0;
          showNativeToast(
            "蓝牙权限检查多次超时，请检查网络连接或稍后重试",
            3000
          );
        }
      } else if (errorMessage.includes("postMessage")) {
        showNativeToast("通信接口不可用，请升级微信版本", 3000);
      } else {
        showNativeToast("检查蓝牙权限失败，请稍后重试", 2000);
      }
    });
}

function openBluetoothSettings() {
  console.log("点击了打开蓝牙设置按钮，尝试与小程序通信");

  // 备选方案：使用原始的wx.miniProgram.postMessage方法
  wx.miniProgram.postMessage({
    data: "button_clicked",
  });
  // Bridge.call("openBluetoothSettings", {}, function (res) {

  // })
  // wx.miniProgram.onCopyUrl(() => {
  //   console.log("点击了复制链接按钮，尝试与小程序通信");
  //   return '111111'
  // })
  setTimeout(() => {
    window.scrollTo(0, 0); // 执行页面滚动操作触发消息传递
  }, 100);
  showNativeToast("正在请求蓝牙权限...", 2000);
}

// 统一处理Bridge调用错误的辅助函数
function handleBridgeError(error) {
  const errorMessage =
    error instanceof Error ? error.message : JSON.stringify(error);

  // 根据错误类型显示不同的提示信息
  if (errorMessage.includes("wx对象不存在")) {
    showNativeToast("当前不在微信环境中", 3000);
  } else if (errorMessage.includes("不在小程序环境中")) {
    showNativeToast("请在微信小程序中打开此页面以使用蓝牙功能", 3000);
  } else if (errorMessage.includes("postMessage")) {
    showNativeToast("通信接口不可用，请升级微信版本", 3000);
  } else if (errorMessage.includes("超时")) {
    showNativeToast("通信超时，请检查网络连接后重试", 3000);
  } else {
    showNativeToast("与小程序通信失败，请稍后重试", 2000);
  }
}

function scanDevices() {
  // 使用bridge调用小程序的扫描设备方法
  Bridge.invoke("startBluetoothDevicesDiscovery", {}, (res) => {
    if (res && res.devices?.length) {
      res.devices.forEach((d) => {
        if (!devices.value.find((item) => item.deviceId === d.deviceId)) {
          devices.value.push(d);
        }
      });
    }
  });
}

function connectDevice(deviceId) {
  if (connectedDevices.value.has(deviceId)) {
    console.log("设备已连接:", deviceId);
    isConnect.value = true;
    return;
  }

  // 使用bridge调用小程序的连接设备方法
  Bridge.invoke("createBLEConnection", { deviceId }, (res) => {
    if (res && res.type === "connected") {
      console.log("设备连接成功:", res);
      connectedDevices.value.add(deviceId);
      isConnect.value = true;
    } else if (res && res.type === "notify") {
      console.log("收到设备数据:", res.data);
      notifyData.value = JSON.stringify(res.data, null, 2);
    } else if (res && res.type === "error") {
      console.error("蓝牙错误:", res.msg);
    }
  });
}

function disconnectBtn() {
  console.log("正在断开设备连接");

  // 遍历所有已连接的设备并断开连接
  connectedDevices.value.forEach((deviceId) => {
    // 使用bridge调用小程序的断开连接方法
    Bridge.invoke("closeBLEConnection", { deviceId }, (res) => {
      if (res && res.success) {
        console.log("设备断开连接成功:", deviceId);
        connectedDevices.value.delete(deviceId);
        isConnect.value = false;
      } else {
        console.error("设备断开连接失败:", res?.msg || "未知错误");
      }
    });
  });
}

onMounted(() => {
  initWx();
  // checkBluetoothAvailable();
});

/**
 * 使用URL方式向小程序发送字符串消息
 * 这是推荐的方式，实时性和可靠性更好
 */
function sendMessageByUrl(message) {
  console.log("通过URL发送消息:", message);

  const timestamp = Date.now();

  let baseUrl = window.location.href.split("?")[0];
  const newUrl = `${baseUrl}?msg=${message}&t=${timestamp}`;

  window.location.href = newUrl;
}

/**
 * 使用URL方式向小程序发送JSON对象消息
 */
function sendJsonMessageByUrl(jsonMessage) {
  // 将JSON对象转换为字符串
  const messageStr = JSON.stringify(jsonMessage);
  // 调用上面的函数发送消息
  sendMessageByUrl(messageStr);
}

/**
 * 使用postMessage方式向小程序发送消息
 * 这是备用方式，可能存在延迟
 */
function sendMessageByPostMessage(message) {
  console.log("通过postMessage发送消息:", message);

  try {
    // 调用微信小程序提供的API
    wx.miniProgram.postMessage({
      data: message,
    });

    // 尝试执行页面操作来触发消息传递（尽管用户反馈这种方式不行）
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
  } catch (error) {
    console.error("postMessage调用失败:", error);
  }
}

/**
 * 监听来自小程序的消息
 */
function onMessageFromMiniProgram(e) {
  // 这里是H5接收小程序消息的回调函数
  // 实际使用时需要根据小程序的通信协议进行实现
  console.log("H5收到来自小程序的消息:", e);
}

// 初始化微信小程序环境检测
function initWxMiniProgram() {
  if (typeof window.wx !== "undefined") {
    console.log("检测到微信小程序环境");
    // 这里可以添加更多的初始化逻辑
  }
}

// 页面加载完成后初始化
window.onload = function () {
  initWxMiniProgram();
};
</script>

<style scoped lang="scss">
.home-container {
  background: linear-gradient(#ccdee8 0%, #f7f7f7 100%);
  min-height: 100%;
  width: 100%;
  padding: 8px 15px 20px;
  //overflow-y: scroll;
}
.title {
  color: #242748;
  font-size: 19px;
  font-weight: Medium;
}
.open-btn {
  color: #242748;
  font-size: 12px;
  font-weight: Regular;
  margin-top: 2px;
}
.glass-box {
  margin-top: 20px;
  .glass-photo {
    width: 100%;
  }
  .glass-tips {
    text-align: center;
    font-size: 14px;
    color: #a19d9d;
  }
  .add-glass-btn {
    background-color: #242748;
    width: 110px;
    height: 32px;
    text-align: center;
    line-height: 32px;
    color: #ffffff;
    font-size: 18px;
    font-weight: Medium;
    border-radius: 5px;
    margin: 40px auto 0px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 4px 5px;
    box-sizing: border-box;
    .add-icon {
      width: 20px;
      height: 20px;
    }
  }
}
.connect-box {
  display: flex;
  justify-content: center;
  align-items: center;
  color: #000000;
  font-size: 14px;
  .bluetooth-icon {
    width: 18px;
    height: 18px;
  }
}
.disconnect-btn {
  background-color: #242748;
  border-radius: 8px;
  color: #ffffff;
  font-weight: Medium;
  font-size: 16px;
  padding: 2px 0;
  width: 96px;
  margin: 60px auto 0;
  text-align: center;
}
.discover-box {
  margin-top: 60px;
  padding: 0 40px;
  z-index: 2;
  position: relative;
  .discover-title {
    font-size: 14px;
    color: #a19d9d;
    font-weight: Regular;
    margin-bottom: 8px;
    margin-left: 17px;
  }
  .discover-item {
    box-shadow: 0px 2px 4px 0px rgba(36, 39, 72, 0.35);
    background-color: #fff;
    border-radius: 7px;
    padding: 8px 17px;
    .discover-name {
      font-size: 16px;
      color: #000000;
      font-weight: Medium;
    }
    .discover-id {
      font-size: 12px;
      color: #a19d9d;
      font-weight: Regular;
    }
    .discover-btn {
      color: #242748;
      font-size: 12px;
      margin-top: 10px;
    }
  }
  .discover-item + .discover-item {
    margin-top: 10px;
  }
}
.brand-name {
  font-size: 80px;
  font-weight: Medium;
  color: #dcdee3;
  position: fixed;
  bottom: 40px;
  z-index: 1;
  // left: 50%;
  // transform: translateX(-50%);
}
.connect-info {
  position: relative;
  z-index: 3;
  margin-top: 30px;
  color: #000;
  .battery-info,
  .volume-info {
    box-shadow: 0px 2px 4px 0px rgba(36, 39, 72, 0.35);
    background-color: #fff;
    border-radius: 12px;
    padding: 8px 17px;
  }
  .volume-info {
    margin-top: 10px;
  }
  .battery-box,
  .volume-box {
    display: flex;
    align-items: center;
  }
  .battery-icon,
  .volume-icon {
    width: 14px;
    height: 14px;
    margin-left: 5px;
    margin-top: -1px;
  }
  .battery-percent {
    margin-top: 10px;
    display: flex;
    justify-content: space-between;
    gap: 40px;
    font-size: 12px;
    color: #000000;
    font-family: SourceHanSansCN;
    .left-battery,
    .right-battery {
      flex: 1;
    }
    .left-battery-text,
    .right-battery-text {
      font-weight: bold;
      font-size: 14px;
    }
    .left-battery-time,
    .right-battery-time {
      font-weight: 400 !important;
      margin-left: 5px;
    }
    .battery-line-box {
      display: flex;
      align-items: center;
      margin-top: 10px;
      .battery-line-text {
        color: #a19d9d;
        font-size: 12px;
        margin-left: 4px;
        margin-top: -2px;
      }
    }
    .battery-line {
      width: 100%;
      height: 6px;
      background-color: #d8d8d8;
      border-radius: 3px;
      .battery-line-fill {
        background-color: #242748;
        width: 50%;
        height: 100%;
        border-radius: 3px;
      }
    }
  }
  .volume-bar-box {
    margin-top: 10px;
    display: flex;

    .volume-icon2 {
      width: 17px;
      height: 17px;
      margin-right: 5px;
    }
    .volume-line {
      width: 100%;
      height: 16px;
      background-color: #d8d8d8;
      border-radius: 5px;
      .volume-line-fill {
        width: 50%;
        height: 100%;
        background-color: #242748;
        border-radius: 5px;
      }
    }
  }
}
</style>
