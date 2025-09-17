export default {
  plugins: {
    'postcss-pxtorem': {
      rootValue: 37.5, // 设计稿宽度的1/10，假设设计稿宽度为375px
      propList: ['*'], // 要转换的属性，*表示全部
      unitPrecision: 5, // 转换后的精度，即小数点位数
      selectorBlackList: ['no-rem'], // 要忽略的选择器，添加.no-rem类名的元素不会被转换
      replace: true, // 直接替换而不是添加备用属性
      mediaQuery: false, // 不处理媒体查询中的px
      minPixelValue: 1, // 小于1px的不会被转换
      exclude: /node_modules/i // 排除node_modules目录
    }
  }
}
