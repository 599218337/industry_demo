import { typeExt } from '../util/typeExt'
// 类型示例******
namespace AnnotationExample {
  /**
   * {@link AnnotationExample.FunctionExample | 回到FunctionExample}.
   *
   * {@link AnnotationExample.ClassExample | 回到ClassExample}.
   */
  export type TypeExample = {
    /**
     * @param id - ID。必传
     */
    id: string
    /**
     * @param label - 别名，可缺省
     */
    label: string
    /**
     * @param 地址，必须
     */
    url: string
    /**
     * @param 名字，根据需要，是否编写
     */
    name: string
    [key: string]: any
  }
  /**
   * {@link AnnotationExample.ClassExampleExt |回到ClassExampleExt}.
   */
  export type TypeExampleExt = TypeExample
  /**
   * 由{@link TypeExample}衍生出的类型，让label、name属性变为可选属性
   */
  export type TypeExampleUseTypeExt = typeExt.Optional<TypeExample, 'label' | 'name'>

  /**
   * work方法的类型定义
   * {@link notDeprecatedClass.work}
   */
  export type CancellationToken = {
    /**
     * token信息
     */
    token: string
    /**
     * 名称
     */
    name: string
    /**
     * 文本信息
     */
    txt?: string
  }
}

// 接口示例******
namespace AnnotationExample {
  /**
   * 接口注释示例
   * @remarks 备注
   */
  export interface InterfaceExample {
    /**
     * 具体数据
     */
    data: object
    /**
     * 状态信息
     */
    status: number
    /**
     * 请求等待状态
     */
    pending: string
    /**
     * 结果数组
     */
    result: any[]
    /**
     * 关联的flag 的 strict
     */
    strict?: boolean
    /**
     * @defaultValue 如果 `strict` 是 `true`，则为 `true`，否则为 `false`
     * @description 标记 `@defaultValue` 可用于记录访问器或属性的默认值。默认主题不会将特殊行为附加到此标签，而是像其他块标签一样在 # Default Value 标题下显示其内容。
     */
    flag: boolean
  }
  /**
   * @description 要被缺省的数据类型
   */
  export type OmitType = {
    status: number
    pending: string
    flag: boolean
  }
  /**
   * @description 要被缺省的数据类型
   */
  export type OmitType1 = {
    data: object
  }
  /**
   * 根据{@link OmitType | OmitType}类型中的字段，把{@link InterfaceExample | InterfaceExample}类型中的对应字段变为缺省字段，由此衍生出新的类型
   */
  export type InterfaceExampleUseTypeExt = typeExt.Optional<InterfaceExample, keyof OmitType>
  /**
   * 根据{@link OmitType1 | OmitType1}类型中的字段，把{@link InterfaceExample | InterfaceExample}类型中的对应字段变为缺省字段，由此衍生出新的类型
   */
  export type InterfaceExampleUseTypeExt1 = typeExt.Optional<InterfaceExample, keyof OmitType1>

  /**
   * 此标记用于通过从另一个 API 项复制 API 项的文档来自动生成该文档。标记参数包含对其他项的引用，该项可能是不相关的类，甚至是从单独的 NPM 包导入的。 `@inheritDoc` 不会复制整个评论正文。仅复制以下标记：`摘要部分`、`@remarks `、`@param `、`@typeParam `、`@return`，其他标签，如 `@defaultValue ` 或 `@example` 未复制，需要在 `@inheritDoc` 标签后显式包含。指定 `@inheritDoc` 标记时，注释中既不能指定摘要部分，也不能指定 `@remarks ` 该部分。
   *
   * @see [TSDoc - @inheritDoc](https://tsdoc.org/pages/tags/inheritdoc/)
   *
   * @see [[include:index.md]]
   *
   * @description inheritDoc 测试 {@link ClassExample}
   *
   * @inheritDoc AnnotationExample.ClassExample
   *
   */
  export interface inheritClassExample {}
}

// 函数示例******
namespace AnnotationExample {
  let exampleUrl = 'http://localhost:9536/example?treeCurrentKey=migrationLine'
  //配置了nginx代理后的地址参数访问示例页面地址
  let exampleUrlproxy = 'http://localhost:8023?treeCurrentKey=migrationLine'
  /**
   * 未进行任何标签标记的注释视为注释摘要
   * @description  示例函数，`@description`标签为该API的描述信息。
   * @description  在typedoc.json中includes节点配置了../readme，因此会直接读取md文件中内容，根据如下引用方式，会把md文档中的内容，使用进来。
   *
   *  【一级文件目录md】
   * [[include:index.md]]
   *  【二级文件目录md】
   * [[include:/function/index.md]]
   * `@see`标签用于生成与当前API相关的 API 或其他资源的引用列表。 @see [FunctionExample - Wikipedia](https://en.wikipedia.org/wiki/Factorial)
   *
   * 本地代码示例  {@link http://localhost:9536/example?treeCurrentKey=migrationLine | 迁徙线}
   *
   * nginx代理示例 {@link http://localhost:8023?treeCurrentKey=migrationLine | 迁徙线}
   *
   * `@link `标记用于引用另一个记录的声明，即跳转到另外一个API文档位置。外部超链接应使用 `Markdown [text](link)` 样式链接构建，而不是使用 `@link `标记。 {@link AnnotationExample.TypeExample | 点这点这TypeExample}
   *
   * @remarks 备注
   *
   * @param {AnnotationExample} options -
   * @property layer - The layer name for WMTS requests.
   * @return {*}
   * @example `@example`标记指示以下文本是如何使用该函数的示例。
   * ```ts
   * gs3d.global.AnnotationExample.FunctionExample({})
   * ```
   */
  export function FunctionExample(options: AnnotationExample.TypeExample) {}
  export function FunctionExampleUseTypeExt(options: AnnotationExample.TypeExampleUseTypeExt) {}

  /**
   * 标记 `@typeParam` 用于记录函数、方法、类、接口或类型别名的类型参数。TypeDoc 将 `@template` 标签识别为 `@typeParam ` 的别名。
   * @typeParam T - 泛型任意对象
   * @typeParam K - T对象中的key
   * @param obj - 任意对象
   * @param name - obj对象中某个key
   * @returns {T[K]} obj对象对应key的值
   */
  export function typeParamFunctionExample<T, K extends keyof T & string>(obj: T, name: K): T[K] {
    return obj[name]
  }
  let testobj = {
    x: '坐标',
    y: '好大个瓜',
    z: 0,
    ppp: ['1', 2, { 对象: '将军' }]
  }
  /**
   * @param options - 整个参数的文档
   * @param options.value - “value”属性的文档
   * @param options.nested.value - 不支持
   */
  export function optionsFunctionExample(options: { value: string; nested: { value: string } } | undefined) {}

  /**
   * `@label `标记可用于为重载签名提供一个名称，该名称可通过声明引用来引用该 `@label `标签。`@label `标记指定的标识符应仅 A-Z 包含 、 0-9 和 _ ，并且不应以数字开头。如果标识符与此模式不匹配，则 TypeDoc 在通过声明引用进行引用时将无法使用它。
   * {@label BASE}
   * @overload
   */
  export function overloadFunctionExample(x: number)
  /**
   * {@label PRECISION}
   * @overload
   */
  export function overloadFunctionExample(x: number, y: number)
  export function overloadFunctionExample(x: number, y = 0): number {
    return x + y
  }
  /**
   * 四舍五入的值 {@link overloadFunctionExample:PRECISION}
   */
  export const overloadFunctionExampleRes = overloadFunctionExample(123.456, 2)

  /**
   * @category Tag_12
   * @description 当在页面索引中列出时，该 `@category` 标记可用于将多个相关的 API 项放在一个公共标题下。可以多次指定在多个标题下列出API。点击文档中AnnotationExample节点会发现functionCategoryTagA\functionCategoryTagB\functionCategoryTag1\functionCategoryTag2根据`@category`标记进行了分组
   */
  export function functionCategoryTag1(): void {}
  /**@category Tag_12 */
  export function functionCategoryTag2(): void {}
  /**@category Tag_AB */
  export function functionCategoryTagA(): void {}
  /**@category Tag_AB */
  export function functionCategoryTagB(): void {}
}

// 类示例******
namespace AnnotationExample {
  /**
   * ClassExample TSDoc类注释示例
   * @remarks 备注信息ClassExample
   * @description 测试此部分的信息会不会被 inheritDoc 复制，然后跳转查看{@link inheritClassExample},{@link ClassExampleExt}
   */
  export class ClassExample {
    /**
     * 公共只读属性。
     */
    readonly readonlyVariable: number

    /**
     * 可以重新分配的公共属性。
     */
    public publicVariable: string

    /**
     * 可选的受保护属性。
     *
     */
    protected protectedVariable?: string

    /**
     * 通过 getter {@link ClassExample#privateVariable} 和 setter {@link ClassExample#privateVariable} 访问的私有属性。
     */
    private _privateVariable = 0

    /**
     * @group Events
     * @description `@event` 标记等同于`@group Events`，`@eventProperty `等价于 `@group Events`，表示将单独开启一个Events的组别，把有`@event`标记的放在一起
     * @description 当在页面索引中列出时，该 `@group 组名` 标记可用于将多个相关的 API 项放在一个公共标题下。可以多次指定在多个标题的API。
     * @description 与`@category ` 标签不同, 如果未指定 `@group 组名`的组名，将根据其类型自动放置在标题下。此标记可用于模拟自定义成员类型。
     */
    static readonly extendsGroupTag = '@group Events'
    /**@group AAA*/
    static readonly extendsGroupTagA = '@group AAA'
    /**@group BBB*/
    static readonly extendsGroupTagB = '@group BBB'
    /**
     * @group
     * @description 未指定的分组会根据变量类型自动归类，改变extendsGroupTagC的类型，会发现其会自动转换在各个标题下
     */
    extendsGroupTagC = '@group '

    /**
     * @hidden
     * @description `@hidden `标记将从文档中删除。它等同于 `@ignore` 标记
     */
    hiddenTag: () => void
    /**
     * @ignore
     * @description `@ignore  `标记将从文档中删除。它等同于 `@hidden ` 标记
     */
    ignoreTag: () => void
    /**
     * @internal
     * @description `@internal` 标记指示该 API 不应被使用者使用。通过指定 --excludeInternal 选项，可以从生成的文档中删除注释的 `@internal` API 项。
     */
    internalTag: () => void

    /**
     * ClassExample类的构造函数。
     * @param options - ClassExample类的参数，点击`TypeExample`跳转到参数具体定义
     */
    constructor(options: AnnotationExample.TypeExample) {}

    /**
     * 使用箭头函数定义的公共方法。TypeDoc 知道将其记录为方法而不是属性。
     * @public
     */
    public ArrowFunction = (): void => {
      this._privateVariable++
    }

    /**
     * ClassExample中【公共】方法
     * @public
     * 一般不应使用此标记。该 `@public` 标记将覆盖反射的可见性，使其公开。这并不完全符合 TSDoc 规范，该规范将成员可见性和发布可见性分开处理。
     */
    public publicMethod() {}
    /**
     * ClassExample中【私有】方法
     * @alpha
     * `@alpha`是内部测试版，表示最初的版本，一般不向外部发布。`@alpha`版会有很多Bug，除非你想去测试最新的功能，否则一般不建议使用。
     */
    private privateMethod() {}
    /**
     * ClassExample中【静态】方法
     * @beta
     * `@beta`是相对于`@alpha`版已有了很大的改进，消除了严重的错误，但还是存在着一缺陷，需要经过多次测试来进一步消除。这个阶段的版本会一直加入新的功能。TSDoc 规范指出， `@beta` 标记 应将和 `@experimental` 标记 视为语义等效的标记。TypeDoc 用户通常应该使用其中之一，但不能同时使用两者。
     */
    static staticMethod() {}
    /**
     * @experimental  添加`@experimental`此标记，docs上会出现此标签，用于指示关联的成员最终旨在由第三方开发人员使用，但尚不够稳定，无法符合语义版本控制要求。与`@beta`同义，切记二选一。
     */
    static experimentalMethod() {}
    /**
     * ClassExample中【受保护】方法
     * @alpha
     */
    protected protectedMethod() {}

    /**
     * 私有“_privateVariable”属性的 getter。
     */
    get privateVariable(): string {
      return `#${this._privateVariable}`
    }

    /**
     * 私有“_privateVariable”属性的 setter。
     */
    set privateVariable(value: string | number) {
      if (typeof value === 'number') {
        this._privateVariable = value
      } else {
        this._privateVariable = parseInt(value.replace(/#/g, ''))
      }
    }
  }

  /**
   * {@inheritDoc ClassExample}
   *
   * @description 跳转：{@link ClassExample}
   *
   * 继承类，继承于{@link ClassExample}
   */
  export class ClassExampleExt extends ClassExample {
    /**
     * ClassExampleExt类的构造函数。
     * @param options - ClassExampleExt类的参数，点击{@link TypeExampleExt}跳转到参数具体定义
     */
    constructor(options: TypeExampleExt) {
      options = {
        id: '',
        label: '',
        url: '',
        name: '',
        key: 0
      }
      super(options)
    }
  }

  /**
   * 即将被废弃的deprecatedClass类
   * @deprecated 请改用 {@link notDeprecatedClass}。
   * @description 该 `@deprecated` 标记表示不应该使用的API，并且可能在将来的版本中删除。
   */
  export class deprecatedClass {}

  /**
   * 由deprecatedClass类迁移改造后的notDeprecatedClass类
   */
  export class notDeprecatedClass {
    /**
     * @deprecated 这种调用方式可能已被弃用，在某些API存在多个声明时，其中个别声明可能会被弃用，可针对单个声明进行标记
     */
    work(): void
    /**
     * 未被弃用的调用方式
     */
    work(token: AnnotationExample.CancellationToken): void
    work(token?: AnnotationExample.CancellationToken) {
      // ...
    }
  }
}

// 属性示例******
namespace AnnotationExample {
  /**
   * 常量属性
   */
  export const ConstExample = 3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679821480865132823066470938446095505822317253594081284811174502841027019385211
  /**
   * 变量属性
   */
  export let LetExample = {
    /**
     * sdk name
     */
    gs3d: 'is not nb',
    /**
     * css使用谁
     */
    css: 'sass',
    /**
     * 啤酒有哪些
     */
    bear: ['orange boom', 'tempt 7No.']
  }

  /**
   * 推荐的枚举定义格式
   * @enum
   * @description 使用 `@enum` 标记会把枚举显示到API文档中
   *
   * 枚举请查看文档[TypeScript 手册中的疯狂枚举示例](https://www.typescriptlang.org/docs/handbook/enums.html#computed-and-constant-members).
   *
   * 此枚举包含【常量成员】和【计算成员】。
   *
   * TypeDoc 不会显示【计算成员】的【值】，因为此信息仅在运行时可用。
   */
  export enum enumExample {
    /**
     * @description 常量成员
     */
    None,
    Read = 1 << 1,
    Write = 1 << 2,
    ReadWrite = Read | Write,
    /**
     * @description 计算成员
     */
    ComputedMember = '123'.length
  }

  /**
   * 推荐的枚举定义格式
   * 由于 TypeScript 的“枚举”使用起来可能不方便，因此一些包定义了自己的类似枚举的对象:
   *
   * @example
   * ```
   * export const enumExample2 = {
   *     Pending: 'pending',
   *     InProgress: 'inProgress',
   *     Completed: 'completed'
   * } as const
   * ```
   *
   * @enum
   */
  export const enumExample2 = {
    /**
     * @description 状态
     */
    Pending: 'pending',
    InProgress: 'inProgress',
    Completed: 'completed'
  } as const
}

/**
 * @description typedoc 类型注释示例
 * 指定这是模块注释，并将其重命名为 AnnotationExample:
 * @module AnnotationExample
 */
export { AnnotationExample }
