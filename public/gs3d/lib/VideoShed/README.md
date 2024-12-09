## 附件内容说明

##### camera.json

视频融合插件的测试数据

##### VideoShed.js

视频融合插件的核心文件

##### demo.html

视频融合插件的html使用demo

##### style.css

视频融合可能需要的css

## Vue+TS+@gs3d/sdk配置视频融合插件

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

##### 配置@gs3d/sdk/dist/lib中的视频融合插件

tsconfig.app.json

tsconfig.node.json

```json
    "allowJs": true,
    "allowSyntheticDefaultImports": true,
    "outDir": "build"
```

App.vue中的部分使用截图

```vue
<script setup> // ******重点不要开ts
import { onMounted } from 'vue'
import { VideoShed } from '../node_modules/@gs3d/sdk/dist/lib/VideoShed/VideoShed'
onMounted(() => {
  console.log(VideoShed)
})
</script>

<template>
  <div></div>
</template>

```

