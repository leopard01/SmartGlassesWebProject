/**
 * 微信小程序与H5通信的桥接工具
 * 用于处理小程序嵌套H5页面时的双向通信
 */

class Bridge {
  constructor() {
    this.isMiniProgram = false;
    this.callbacks = new Map();
    this.messageQueue = [];
    this.init();
  }

  /**
   * 初始化桥接器
   */
  init() {
    // 检测是否在小程序环境中
    this.checkMiniProgram();
    
    // 注册消息接收监听器
    this.registerMessageHandler();
    
    // 处理队列中的消息
    this.processMessageQueue();
  }

  /**
   * 检查当前是否在小程序环境中
   */
  checkMiniProgram() {
    // 微信小程序环境检测标志
    this.isMiniProgram = window.__wxjs_environment === 'miniprogram';
    console.log('当前环境检测结果: ', this.isMiniProgram ? '小程序环境' : '非小程序环境');
    return this.isMiniProgram;
  }

  /**
   * 注册消息接收处理器
   */
  registerMessageHandler() {
    if (!this.isMiniProgram) return;
    
    // 监听小程序发送的消息
    window.addEventListener('message', (event) => {
      try {
        const data = event.data;
        if (data && data.from === 'miniProgram') {
          console.log('收到小程序消息: ', data);
          this.handleMiniProgramMessage(data);
        }
      } catch (error) {
        console.error('处理小程序消息失败: ', error);
      }
    });
  }

  /**
   * 处理来自小程序的消息
   */
  handleMiniProgramMessage(data) {
    const { action, callbackId, result } = data;
    
    // 处理回调
    if (callbackId && this.callbacks.has(callbackId)) {
      const callback = this.callbacks.get(callbackId);
      callback(result);
      this.callbacks.delete(callbackId);
    }
    
    // 根据action类型分发消息
    switch (action) {
      case 'bluetoothPermission':
        this.handleBluetoothPermission(result);
        break;
      case 'bluetoothDevices':
        this.handleBluetoothDevices(result);
        break;
      case 'deviceConnected':
        this.handleDeviceConnected(result);
        break;
      default:
        console.log('未知的action类型: ', action);
    }
  }

  /**
   * 调用小程序方法
   * @param {string} method - 方法名
   * @param {object} params - 参数
   * @returns {Promise} Promise对象
   */
  call(method, params = {}) {
    return new Promise((resolve, reject) => {
      if (!this.isMiniProgram) {
        console.warn('当前不在小程序环境中，无法调用小程序方法');
        reject(new Error('不在小程序环境中'));
        return;
      }

      const callbackId = `callback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.callbacks.set(callbackId, (result) => {
        if (result && result.error) {
          reject(result.error);
        } else {
          resolve(result);
        }
      });

      try {
        // 向小程序发送消息 - 兼容不同的微信环境
        if (typeof wx.miniProgram?.postMessage === 'function') {
          // 优先使用miniProgram.postMessage
          wx.miniProgram.postMessage({
            data: {
              action: method,
              params: params,
              callbackId: callbackId
            }
          });
        } else if (typeof wx.postMessage === 'function') {
          // 否则使用直接的postMessage
          wx.postMessage({
            data: {
              action: method,
              params: params,
              callbackId: callbackId
            }
          });
        } else {
          throw new Error('未找到可用的postMessage方法');
        }
        
        // 设置超时处理 - 增加超时时间到20秒，适应可能的网络延迟
        setTimeout(() => {
          if (this.callbacks.has(callbackId)) {
            this.callbacks.delete(callbackId);
            reject(new Error(`调用${method}超时，请检查小程序是否正常响应`));
          }
        }, 20000); // 20秒超时
      } catch (error) {
        console.error('调用小程序方法失败: ', error);
        this.callbacks.delete(callbackId);
        reject(error);
      }
    });
  }

  /**
   * 调用小程序invoke方法
   * @param {string} method - 方法名
   * @param {object} params - 参数
   * @param {function} callback - 回调函数
   */
  invoke(method, params = {}, callback) {
    console.log('invoke: ', wx);
    if (!this.isMiniProgram) {
      console.warn('当前不在小程序环境中，无法调用invoke方法');
      if (typeof callback === 'function') {
        callback({ error: '不在小程序环境中' });
      }
      return;
    }

    try {
      // 兼容不同的微信环境
      if (typeof wx.miniProgram?.invoke === 'function') {
        // 优先使用miniProgram.invoke
        wx.miniProgram.invoke(method, params, callback);
      } else if (typeof wx.invoke === 'function') {
        // 否则使用直接的invoke
        wx.invoke(method, params, callback);
      } else {
        // 如果都不可用，尝试使用call方法作为备选
        console.warn('未找到可用的invoke方法，尝试使用call方法');
        this.call(method, params).then(result => {
          if (typeof callback === 'function') {
            callback(result);
          }
        }).catch(error => {
          console.error('调用小程序方法失败: ', error);
          if (typeof callback === 'function') {
            callback({ error: error.message });
          }
        });
      }
    } catch (error) {
      console.error('调用小程序invoke方法失败: ', error);
      if (typeof callback === 'function') {
        callback({ error: error.message });
      }
    }
  }

  /**
   * 处理蓝牙权限结果
   */
  handleBluetoothPermission(result) {
    console.log('蓝牙权限结果: ', result);
    // 可以在这里触发自定义事件或调用全局回调
  }

  /**
   * 处理蓝牙设备列表
   */
  handleBluetoothDevices(result) {
    console.log('蓝牙设备列表: ', result);
    // 可以在这里触发自定义事件或调用全局回调
  }

  /**
   * 处理设备连接结果
   */
  handleDeviceConnected(result) {
    console.log('设备连接结果: ', result);
    // 可以在这里触发自定义事件或调用全局回调
  }

  /**
   * 处理消息队列
   */
  processMessageQueue() {
    // 如果在初始化前有消息被加入队列，这里处理
    while (this.messageQueue.length > 0 && this.isMiniProgram) {
      const { method, params, callback } = this.messageQueue.shift();
      this.invoke(method, params, callback);
    }
  }
}

// 创建单例实例
const bridgeInstance = new Bridge();

export default bridgeInstance;
