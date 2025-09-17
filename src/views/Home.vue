<template>
  <div class="home-container">
    <div class="title">Silicon AI</div>
    <div class="open-btn">打开蓝牙设置</div>
    <div class="glass-box">
      <img src="../assets/images/glass-photo.png" class="glass-photo" alt="" />
      <div class="glass-tips">设备未连接</div>
      <div class="glass-tips">请在手机蓝牙设置中连接智能眼镜</div>
      <div class="add-glass-btn">
        <img class="add-icon" src="../assets/images/add.png" alt="" />
        <span>添加设备</span>
      </div>
    </div>
    <div class="discover-box">
      <div class="discover-title">发现的设备</div>
      <div>
        <div class="discover-item">
          <div class="discover-name">Zzz01</div>
          <div class="discover-id">0a32ee0d-3e91-58b1-15b7-e1fb563e39d3</div>
          <div class="discover-btn">点击连接</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
// import Bridge from "./bridge";
import axios from "axios";
import wx from "weixin-js-sdk";

async function initWx() {
  console.log("===== initWx函数开始执行 ====");
  
  // 检查wx对象
  console.log("-------12初始化------", typeof wx === 'undefined' ? 'wx未定义' : wx);
  console.log("window.wx状态:", typeof window.wx === 'undefined' ? '未定义' : window.wx);
  
  if (!wx && !window.wx) {
    console.error("错误: 微信SDK未加载，请检查是否在index.html中正确引入了微信SDK的CDN链接");
    alert("微信SDK未加载，请检查index.html配置");
    return;
  }
  
  // 统一使用一个wx引用
  const wxInstance = wx || window.wx;
  
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
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      }
    );
    
    clearTimeout(timeoutId); // 清除超时计时器
    
    console.log("-------44res------:::", res);
    console.log("响应状态码:", res.status);
    console.log("响应数据结构:", JSON.stringify(res.data, null, 2));
    
    if (res.status === 200) {
      if (res.data && res.data.code === 1 && res.data.data?.sign) {
        console.log("获取签名成功，开始配置微信SDK");
        
        // 检查是否是在小程序环境中运行
        const isMiniProgram = window.__wxjs_environment === 'miniprogram';
        console.log("是否在小程序环境中:", isMiniProgram);
        
        wxInstance.config({
          debug: true, // 开启调试模式，便于查看错误
          appId: "wx932724bb28254f89",
          timestamp,
          nonceStr,
          signature: res.data.data.sign,
          jsApiList: [
            "checkJsApi",
            "startBluetoothDevicesDiscovery",
            "createBLEConnection",
          ],
        });
        
        console.log("-------55配置完成------");
        
        // 微信SDK准备就绪回调
        wxInstance.ready(function () {
          console.log("微信SDK初始化成功");
          try {
            wxInstance.showToast({
              title: "初始化成功",
              icon: "success",
              duration: 2000,
            });
          } catch (toastError) {
            console.warn("showToast调用失败:", toastError);
          }
        });
        
        // 微信SDK错误回调 - 专门处理域名错误
        wxInstance.error(function (err) {
          console.error("微信SDK初始化失败:", JSON.stringify(err, null, 2));
          
          // 专门处理域名错误
          if (err && (err.errMsg === 'config:invalid url domain' || JSON.stringify(err).includes('invalid url domain'))) {
            console.error("微信域名错误: 当前域名未在微信公众平台JS接口安全域名列表中配置");
            alert("初始化失败: 当前域名未在微信公众平台配置\n请在微信公众平台-开发-接口权限-网页授权-修改JS接口安全域名");
          } else {
            alert("微信SDK初始化失败: " + JSON.stringify(err));
          }
        });
      } else {
        console.error("获取签名失败: 响应数据格式不正确");
        console.error("code:", res.data?.code);
        console.error("msg:", res.data?.msg);
        alert("获取微信签名失败: " + (res.data?.msg || "未知错误"));
      }
    } else {
      console.error("请求签名接口失败: HTTP状态码异常", res.status);
      alert("网络请求失败: 状态码 " + res.status);
    }
  } catch (err) {
    console.error("===== initWx函数执行异常 =====");
    if (err.name === 'AbortError') {
      console.error("请求超时: 超过10秒未收到响应");
      alert("请求微信签名超时，请检查网络连接");
    } else if (err.code === 'ERR_NETWORK') {
      console.error("网络错误: 无法连接到服务器");
      console.error("错误详情:", err);
      alert("网络连接失败，请检查网络设置");
    } else {
      console.error("请求签名接口异常:", JSON.stringify(err, null, 2));
      console.error("错误类型:", err.name);
      console.error("错误信息:", err.message);
      alert("初始化微信SDK失败: " + (err.message || "未知错误"));
    }
  }
  console.log("===== initWx函数执行结束 ====");
}
// ...existing code...

const hasPermission = ref(false);
const devices = ref([]);
const notifyData = ref("");
const connectedDevices = ref(new Set());

function checkBluetooth() {
  console.log("正在检查蓝牙权限检查");
  wx.miniProgram.invoke("checkBluetoothPermission", {}, (res) => {
    console.log("蓝牙权限检查:", res);
    hasPermission.value = res.granted;

    // ✅ 如果已经有权限，自动开始扫描
    if (res.granted) {
      scanDevices();
    }
  });
}

function openBluetoothSettings() {
  //   console.log('在小程序里打开蓝牙设置页面');
  //   wx.miniProgram.postMessage({
  //   data: {
  //     action: "checkBluetoothPermission",
  //   },
  // });
  // 检查蓝牙权限
  // Bridge.call("checkBluetoothPermission").then((res) => {
  //   console.log("蓝牙权限检查结果:", res);
  // });
}

function scanDevices() {
  wx.miniProgram.invoke("startBluetoothDevicesDiscovery", {}, (res) => {
    if (res.devices?.length) {
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
    return;
  }

  wx.miniProgram.invoke("createBLEConnection", { deviceId }, (res) => {
    if (res.type === "connected") {
      console.log("设备连接成功:", res);
      connectedDevices.value.add(deviceId);
    } else if (res.type === "notify") {
      console.log("收到设备数据:", res.data);
      notifyData.value = JSON.stringify(res.data, null, 2);
    } else if (res.type === "error") {
      console.error("蓝牙错误:", res.msg);
    }
  });
}

onMounted(() => {
  initWx();
  // checkBluetooth();
});
</script>

<style scoped lang="scss">
.home-container {
  background: linear-gradient(#ccdee8 0%, #f7f7f7 100%);
  height: 100%;
  width: 100%;
  padding: 8px 15px;
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
.discover-box {
  margin-top: 60px;
  padding: 0 40px;
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
}
</style>
