## 附件内容说明

##### CesiumNavigation.umd.js

罗盘插件的umd文件，可在html文件中以script的方式引入使用

##### index.d.ts

罗盘插件的ts声明文件，如在ts项目中使用罗盘时缺少ts声明，可在ts.config.json中配置相应配置

##### navigation_style_costum.css

常用罗盘样式

##### demo.html

罗盘插件的html使用demo

安装vscode插件live server，在demo.html文件中右键live server启动

##### LICENSE

许可证附件

## Vue+TS+@gs3d/sdk配置罗盘插件

##### 安装@gs3d/sdk并配置（如已安装跳过）

```shell
npm set registry http://192.168.1.93:8081/repository/npmGroup/
npm i
npm i @gs3d/sdk
npm i vite-plugin-static-copy -D
```

vite.config.ts

```json
...
import { viteStaticCopy } from 'vite-plugin-static-copy'
...
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/@gs3d/sdk/dist/lib/*',
          dest: './lib/'
        },
        {
          src: 'node_modules/@gs3d/sdk/dist/gs3d.*',
          dest: './lib/gs3d/'
        },
        {
          src: 'node_modules/@gs3d/sdk/dist/index.d.ts',
          dest: './lib/gs3d/'
        }
      ]
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      cesium: 'node_modules/@gs3d/sdk/dist/lib/CesiumChanged/index.js'
    }
  },
  define: {
    // 配置cesium全局变量
    CESIUM_BASE_URL: "'./lib/CesiumChanged'"
  }
})
```

tsconfig.app.json

```json
  "compilerOptions": {
    "composite": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "cesium": ["node_modules/@gs3d/sdk/dist/lib/CesiumChanged/Cesium.d.ts"]
    }
  }
```

##### 配置@gs3d/sdk/dist/lib中的罗盘插件

```shell
npm i vite-plugin-insert-html -D
```

vite.config.ts

使用插件vite-plugin-insert-html通过配置自动向index.html插入script加载js插入link加载css

注意事项：

罗盘插件的umd文件打包时外部化了Cesium，并使用的是window上的Cesium

如果使用罗盘插件的umd文件，但window上没有挂载Cesium，umd文件内将报错

```json
...
import { insertHtml, h } from 'vite-plugin-insert-html'
...
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/@gs3d/sdk/dist/lib/*',
          dest: './lib/'
        },
        {
          src: 'node_modules/@gs3d/sdk/dist/gs3d.*',
          dest: './lib/gs3d/'
        },
        {
          src: 'node_modules/@gs3d/sdk/dist/index.d.ts',
          dest: './lib/gs3d/'
        }
      ]
    }),
    insertHtml({
      head: [
        h('link', {
          rel: 'stylesheet',
          href: './lib/CesiumChanged/Widgets/widgets.css'
        }),
        h('script', {
          src: './lib/CesiumChanged/Cesium.js'
        }),
        // *****重点
        h('script', {
          src: './lib/cesium-navigation-es6/CesiumNavigation.umd.js'
        }),
         // *****重点
        h('link', {
          rel: 'stylesheet',
          href: './lib/cesium-navigation-es6/navigation_style_costum.css'
        })
      ]
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      cesium: 'node_modules/@gs3d/sdk/dist/lib/CesiumChanged/index.js'
    }
  },
  define: {
    // 配置cesium全局变量
    CESIUM_BASE_URL: "'./lib/CesiumChanged'"
  }
})
```

App.vue中的部分使用截图

```vue
<script setup lang="ts">
import * as Cesium from 'cesium'
import '../node_modules/@gs3d/sdk/dist/lib/CesiumChanged/Widgets/widgets.css'
import { onMounted } from 'vue'
onMounted(() => {
  Cesium.Ion.defaultAccessToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlMmIzZjlhMy1kNzU1LTRmMmQtYTFkNi1jMWQ5NTliM2RmN2YiLCJpZCI6MjU5LCJpYXQiOjE2OTM1ODIzNDJ9.-Tpp8s9ismoMrkKqnNsHFEMZgXDfa2uZfBQRE-kn3gM'
  let viewer = new Cesium.Viewer('map-container', {})
  let CesiumNavigation = (window as any).CesiumNavigation

  const options = {
    enableCompass: true,
    enableZoomControls: false,
    enableDistanceLegend: true,
    // enableDistanceLegend: false,
    enableCompassOuterRing: true,
    compassOuterRingSvg:
      '<svg t="1687252991881" height="64" width="64" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="982" width="200" height="200"><path d="M886.096 520v-16h64v16z" fill="#FFFFFF" p-id="983"></path><path d="M496 928h16v64h-16z" fill="#FFFFFF" p-id="984"></path><path d="M70.112 520v-16h64v16z" fill="#FFFFFF" p-id="985"></path><path d="M228.992 836.288l-11.312-11.312 22.624-22.64 11.328 11.328z" fill="#FFFFFF" p-id="986"></path><path d="M817.296 228.288l-11.312-11.312 22.624-22.64 11.328 11.328z" fill="#FFFFFF" p-id="987"></path><path d="M217.68 205.648l11.312-11.312 22.64 22.624-11.328 11.328z" fill="#FFFFFF" p-id="988"></path><path d="M805.984 813.648l11.312-11.312 22.64 22.624-11.328 11.328z" fill="#FFFFFF" p-id="989"></path><path d="M480 144V52.368h12.432l48.128 72v-72h11.632V144h-12.432l-48.128-72V144z" p-id="990" style="stroke: #000000AA; stroke-width:2; fill:#FF0000;" ></path> </svg>',
    compassRotationMarkerSvg:
      '<svg height="64" width="64" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><g id="#000000fe"><path  opacity="1.00" d=" M 493.42 0.00 L 528.50 0.00 C 529.86 0.78 531.41 1.07 532.98 1.02 C 558.91 1.32 584.63 5.22 610.11 9.75 C 686.00 24.72 758.57 56.91 819.99 104.02 C 838.75 118.42 857.23 133.51 873.12 151.06 C 852.34 172.59 830.81 193.46 809.75 214.75 C 790.09 234.12 770.97 254.08 751.00 273.10 C 711.38 234.16 662.29 204.75 608.90 189.13 C 545.25 170.28 476.14 171.23 412.73 190.59 C 360.53 206.58 313.00 236.14 274.02 274.19 C 251.77 252.75 230.24 230.49 208.25 208.75 C 188.88 189.09 168.91 169.97 149.90 150.00 C 159.46 138.85 171.04 129.70 182.05 120.05 C 263.97 50.32 368.79 8.45 476.01 1.15 C 481.81 0.78 487.70 1.39 493.42 0.00 Z" /></g></svg>',
    compassGyroSvg:
      '<svg viewBox="0 0 17 17" height="26" width="26"><g id="compass-inner" fill-rule="nonzero"><path d="M8.5,16.5 C4.081722,16.5 0.5,12.918278 0.5,8.5 C0.5,4.081722 4.081722,0.5 8.5,0.5 C12.918278,0.5 16.5,4.081722 16.5,8.5 C16.5,12.918278 12.918278,16.5 8.5,16.5 Z M8.5,15.5 C12.3659932,15.5 15.5,12.3659932 15.5,8.5 C15.5,4.63400675 12.3659932,1.5 8.5,1.5 C4.63400675,1.5 1.5,4.63400675 1.5,8.5 C1.5,12.3659932 4.63400675,15.5 8.5,15.5 Z" id="Oval-96"></path><path d="M9.92599835,7.09066832 C12.7122872,9.87695712 14.3709388,12.5452228 13.4497471,13.4664145 C12.5285555,14.3876061 9.86028979,12.7289545 7.074001,9.94266568 C4.2877122,7.15637688 2.62906055,4.48811119 3.55025221,3.56691953 C4.47144386,2.64572788 7.13970955,4.30437952 9.92599835,7.09066832 Z M9.21889157,7.7977751 C6.92836458,5.50724811 4.52075769,4.01062761 4.25735899,4.27402631 C3.99396029,4.53742501 5.49058078,6.9450319 7.78110778,9.2355589 C10.0716348,11.5260859 12.4792417,13.0227064 12.7426404,12.7593077 C13.0060391,12.495909 11.5094186,10.0883021 9.21889157,7.7977751 Z" id="Oval-96-Copy-2"></path><path d="M9.92599835,9.94266568 C7.13970955,12.7289545 4.47144386,14.3876061 3.55025221,13.4664145 C2.62906055,12.5452228 4.2877122,9.87695712 7.074001,7.09066832 C9.86028979,4.30437952 12.5285555,2.64572788 13.4497471,3.56691953 C14.3709388,4.48811119 12.7122872,7.15637688 9.92599835,9.94266568 Z M9.21889157,9.2355589 C11.5094186,6.9450319 13.0060391,4.53742501 12.7426404,4.27402631 C12.4792417,4.01062761 10.0716348,5.50724811 7.78110778,7.7977751 C5.49058078,10.0883021 3.99396029,12.495909 4.25735899,12.7593077 C4.52075769,13.0227064 6.92836458,11.5260859 9.21889157,9.2355589 Z" id="Oval-96-Copy-3"></path><path d="M15.1464466,1.1464466 L14.3453364,1.94755684 L13.9608692,2.33202401 L14.667976,3.03913077 L15.0524431,2.65466362 L15.8535534,1.8535534 L15.1464466,1.1464466 Z M2.29760014,13.995293 L1.85311902,14.4397742 L1.004311,15.2885822 L1.71141776,15.995689 L2.56022581,15.146881 L3.00470698,14.7023998 L2.29760014,13.995293 Z" id="Line"></path><circle id="Oval-432" cx="16" cy="1" r="1"></circle><circle id="Oval-432-Copy" cx="1" cy="16" r="1"></circle></g></svg>'
  }
  let navigation = new CesiumNavigation(viewer, options)
})
</script>

<template>
  <div id="map-container"></div>
</template>
```

