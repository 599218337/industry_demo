/*
 * @Author: lzz 599218337@qq.com
 * @Date: 2024-04-30 09:13:56
 * @LastEditors: lzz 599218337@qq.com
 * @LastEditTime: 2024-04-30 10:22:11
 * @FilePath: /industry_demo/vite.config.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import glsl from 'vite-plugin-glsl'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), glsl()],
  resolve: {
    alias: {
      'cesium': fileURLToPath(new URL('./public/gs3d/lib/CesiumChanged/index.js', import.meta.url)),
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  define: {
    // 模块化使用cesium时，需配置全局变量CESIUM_BASE_URL指向cesium包的四大资源文件夹
    CESIUM_BASE_URL: "'./gs3d/lib/CesiumChanged'",
  },
})
