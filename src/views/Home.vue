
<template>
  <div>
    <h2>蓝牙设备列表</h2>

    <div v-if="!hasPermission">
      <p>未检测到蓝牙权限</p>
      <button @click="openBluetoothSettings">打开蓝牙设置</button>
    </div>

    <div v-else>
      <button @click="initWx">扫描设备</button>
      <ul>
        <li v-for="d in devices" :key="d.deviceId">
          {{ d.name || '未知设备' }} ({{ d.deviceId }})
          <button @click="connectDevice(d.deviceId)">连接</button>
        </li>
      </ul>
    </div>

    <h3>接收的数据:</h3>
    <pre>{{ notifyData }}</pre>
    <button @click="initWx">初始化微信SDK</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
// import Bridge from "./bridge";
import axios from "axios";
import wx from 'weixin-js-sdk';

async function initWx() {
  // 确保 window.wx 已加载
  console.log('-------12------');
  if (!wx) {
    console.error("微信SDK未加载，请检查index.html引入是否正确");
    return;
  }
  const nonceStr = Math.random().toString(36).substr(2, 15);
  const timestamp = Math.floor(Date.now() / 1000);
  const url = window.location.href.split('#')[0];

  console.log('-------33------');
  try {
    const res = await axios.post("https://yb.c-er.com/api/index/mnp_sign", {
      nonceStr,
      timestamp,
      url
    });
    console.log('-------44------');
    console.log(res.data.data.sign);
    if (res.data.code === 1 && res.data.data?.sign) {
      wx.config({
        debug: false,
        appId: "wx932724bb28254f89", // 替换为你的appId
        timestamp,
        nonceStr,
        signature: res.data.data.sign,
        jsApiList: ["checkJsApi", "startBluetoothDevicesDiscovery", "createBLEConnection"]
      });
      console.log('-------55------');
                wx.showToast({
            title: "开始初始化",
            icon: "success",
            duration: 2000
          });
      wx.ready(function() {
        console.log("微信SDK初始化成功");
        if (wx && wx.showToast) {
          wx.showToast({
            title: "初始化成功",
            icon: "success",
            duration: 2000
          });
        } else {
          alert("初始化成功");
        }
        // 可以在这里执行后续微信相关操作
      });

      wx.error(function(err){
        console.error("微信SDK初始化失败:", err);
      });
    } else {
      console.error("获取签名失败:", res.data.msg);
    }
  } catch (err) {
    console.error("请求签名接口异常:", err);
  }
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
  checkBluetooth();
});
</script>
