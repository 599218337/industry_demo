## 附件内容说明

##### geojsonhint.js

geojson校验插件的核心文件

##### geojsonhint.d.ts

geojson校验插件的ts声明文件，如在ts项目中使用罗盘时缺少ts声明，可在ts.config.json中配置相应配置

##### demo.html

geojson校验插件的html使用demo

##### LICENSE

许可证附件

## Vue+TS+@gs3d/sdk配置geojsonhint插件

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

##### 配置@gs3d/sdk/dist/lib中的geojsonhint插件

```shell
npm i vite-plugin-insert-html -D
```

vite.config.ts

```typescript
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
        h('script', {
          src: './lib/geojsonhint/geojsonhint.js' // ******重点
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
import { onMounted } from 'vue'
let geojsonhint = (window as any).geojsonhint
onMounted(() => {
  console.log(geojsonhint.hint)
  let point = {
    type: 'Point',
    coordinates: [-105.01621, 39.57422]
  }
  let errors = geojsonhint.hint(point)
  console.log(errors)
})
</script>
```

