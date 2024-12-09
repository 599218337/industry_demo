/**
 * 类型扩展工具
 */
export namespace typeExt {
  /**
   * @description 将一个对象中，把传入的属性变为可选
   * @typeParam T - 一个TypeScript的type
   * @typeParam K - T中的属性字段，多个属性，用 | 符连接
   *
   * & - intersection交叉类型，且运算
   *
   * Omit - 缺省，将传入的类型中，把指定的类型字段去除掉
   *
   * Partial - 部分，把传入类型中的所有类型字段，变为可选
   *
   * Pick - 挑选，将传入的类型中，把指定的类型字段挑选出来，返回新的类型，新的类型中只包含挑选的类型字段
   * @example
   * ```ts
   * //复制此示例在本文件中测试
   * type OptionalTest = {
   *   name: string
   *   phone: number
   *   attr: object
   *   info: any[]
   *   flag: boolean
   * }
   * type test = Optional<OptionalTest, 'attr' | 'flag'>
   * function test(opt:test){
   *   opt.
   * }//当输入opt.时，会发现ts推断，attr和flag变为了可选属性
   * ```
   * @group 类型工具
   */
  export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

  export type PickOptional<T, K extends keyof T> = Pick<T, K>

  /**
   * 将联合类型转换为交叉类型
   * @typeParam T - 一个TypeScript的联合类型，如{a:string} | {b:number}
   *
   * ```ts
   * type UnionToIntersection<T> = (T extends any ? (x: T) => any : never) extends (x: infer R) => any ? R : never
   * //解释 【建议先了解，类型的协变和逆变，TypeScript的infer】
   * //1.任何类型都可以认为 属于 any 故 T extends any?(x:T)=>any:never 该三目运算 最终结果 (x:T)=>any
   * //2.当联合类型进行三目运算时，会分别运算，当T为{a:string}|{b:number} ，T extends any?(x:T)=>any:never 实际为
   * //{a:string} extends any?(x:{a:string})=>any:never | {b:number} extends any?(x:{b:number})=>any:never 即
   * //(x:{a:string})=>any|(x:{b:number})=>any
   * //3.由2变成 (x:{a:string})=>any|(x:{b:number})=>any extends (x: infer R) => any ? R : never，运用infer和函数参数逆变
   * //依据TS infer功能 T extends [结构体 infer R] ? R : T ，
   * //故是要推断 (x:{a:string})=>any|(x:{b:number})=>any的函数参数类型，同时依据函数参数逆变
   * //最终推断结果 R 为 {a:string} & {b:number}，即把联合类型转换成了交叉类型
   * type UnionToIntersectionTest = UnionToIntersection<{a:string}|{b:number}|{c:boolean}>
   * ```
   * #*类型的协变和逆变*
   *
   * 赋值 - 允许发生协变
   *
   * 函数返回值 - 允许发生协变
   *
   * 函数参数- 允许发生逆变
   * ```
   * 理解概念
   * 内涵: 概念中所反映的事物的特有属性。
   * 外延: 具有概念所反映的特有属性的所有事物。
   * 内涵越小的概念, 覆盖的范围越多, 外延越多。如：动物 => 狗 => 柴犬 => 幼年柴犬。
   * ```
   * ```
   * //协变，类型收敛 内涵缩小 外延扩大
   * //赋值 看这一部分理解，不要在概念上死记，根据下面类型大小例子体会，逆变就是与之相反
   * type Big = {a:string} | {b:number}    //类型大  可接收 {a:'s'} {b:1} {a:'ss',b:11} 三种情况
   * type Small = {a:string} & {b:number}  //类型小  只能接收 {a:'ss',b:11} 一种情况
   * //{a:'s'} {b:1} {a:'ss',b:11}
   * let big:Big
   * let small:Small
   * small = big//发生协变，报错，不能将类型“Big”分配给类型“Small”。
   * big = small//正确
   *
   * //返回值
   * let fnbig = () => big
   * let fnsmall = () => small
   * fnsmall = fnbig //发生协变，报错，不能将类型“() => Big”分配给类型“() => Small”。
   * fnbig = fnsmall //正确
   * ```
   * ```
   * //逆变，类型外散 内涵扩大 外延缩小
   * //函数参数
   * class Animal {
   *   base = ''
   * }
   * class Dog extends Animal {
   *   type = 'Dog'
   * }
   * let fn1 = (animal: Animal) => {}
   * let fn2 = (dog: Dog) => {}
   * fn1 = fn2 // error 不安全的 Type '(dog: Dog) => void' is not assignable to type '(animal: Animal) => void'.
   * fn2 = fn1 // 发生了逆变 类型外散 Animal => Dog 内涵扩大了 外延缩小了
   * ```
   * @group 类型工具
   */
  export type UnionToIntersection<T> = (T extends any ? (x: T) => any : never) extends (x: infer R) => any ? R : never
  /**
   * 使用TS自带infer推断
   *
   * <h3>固定语法</h3> <p style="color:red">T extends [结构体 infer R] ? R : T</p>
   * @typeParam T - 需要被推断的类型
   * @example
   * ```ts
   * //自定义推断函数结果
   * type Return<T> = T extends (...args: any[]) => infer R ? R : T
   * type sum = (a: number, b: number) => number
   * type concat = (a: any[], b: any[]) => any[]
   * // 自定义
   * let sumR_: Return<sum>//推断出 sumR_: number
   * let concatR_: Return<concat>//推断出 concatR_: any[]
   * // TS原生
   * let sumR: ReturnType<sum>//推断出 sumR: number
   * let concatR: ReturnType<concat>//推断出 concatR: any[]
   * ```
   * @example
   * ```ts
   * //自定义推断Promise参数类型
   * type PromiseType<T> = T extends Promise<infer K> ? PromiseType<K> : T
   * type pr = PromiseType<Promise<string>>//推断出 type pr = string
   * type prdeep = PromiseType<Promise<PromiseType<Promise<number>>>>//推断出 type prdeep = number
   * ```
   * @example
   * ```ts
   * //自定义推断函数某个参数类型
   * type FirstArg<T> = T extends (first: infer F, ...args: any[]) => void ? F : T
   * type fi = FirstArg<(name: string, age: number) => void>//推断出 type fi = string
   * type fi1 = FirstArg<(name: any[]) => void>//推断出 type fi1 = any[]
   * type fi2 = FirstArg<() => void>//推断出 type fi2 = unknown
   * type fi3 = FirstArg<123>//推断出 type fi3 = 123
   * ```
   * @example
   * ```ts
   * //自定义推断元组类型
   * type ArrayType<T> = T extends (infer A)[] ? A : T
   * type ItemType1 = ArrayType<[string, number]>//推断出 type ItemType1 = string | number
   * type ItemType2 = ArrayType<string[]>//推断出 type ItemType2 = string
   * ```
   * @group 类型工具
   */
  export type InferExample<T> = T extends (...args: any[]) => infer R ? R : T

  /**
   * @description 由字段推导函数参数类型收缩过程 示例
   * ```
   * 过程解释：
   * 1.假设写了一个监听方法typeFuncExample，并进行调用，希望结果是，在使用方法typeFuncExample的回调方法on时，会自动进行类型推断提示，并且提示的内容与方法typeFuncExample的入参类型保持一致
   * 2.on方法中，第一个参数会自动提示为要输入 firstNameChanged|lastNameChanged...，第二个回调参数的入参会自动根据第一个入参提示类型(修改第一个参数，鼠标移到oldVal上查看类型)
   * 3.不关心typeFuncExample方法的实现，先声明typeFuncExample方法，declare function typeFuncExample(options:object): funcExampleTypes
   * 4.定义3中缺失funcExampleTypes，
   * type funcExampleTypes = {
   *    on(eventName: string, callback: (oldVal: any, newVal: any) => void): void
   * }
   * 5.开始进行类型收缩，希望on方法第一个参数为'???Changed'，???希望为typeFuncExampleOptions的key，故3中typeFuncExample需接收一个泛型T，typeFuncExample<T>(options: T): funcExampleTypes<T>，对应funcExampleTypes也接收T改为，同时eventName: string调整为eventName: `${string & keyof T}Changed`
   * type funcExampleTypes<T> = {
   *    on(eventName: `${string & keyof T}Changed`, callback: (oldVal: any, newVal: any) => void): void
   * }
   * 6.5中eventName已经收缩，但是callback参数没有收缩，oldVal应该是typeFuncExampleOptions中key对应的value的类型，假设为K，oldVal:T[K]，进一步调整
   * type funcExampleTypes<T> = {
   *    on(eventName: `${string & keyof T}Changed`, callback: (oldVal: T[K], newVal: T[K]) => void): void
   * }
   * 7.6中缺失K，K应该来自于on的泛型，即on<K>,且K来自于typeFuncExampleOptions的key，即on<K extends string & keyof T></K>，string &为了排除symbol类型，则进一步调整
   * type funcExampleTypes<T> = {
   *  on<K extends string & keyof T>(eventName: `${string & keyof T}Changed`, callback: (oldVal: T[K], newVal: T[K]) => void): void
   * }
   * 8.7中K已收缩，故简化
   * type funcExampleTypes<T> = {
   *  on<K extends string & keyof T>(eventName: `${string & keyof T}Changed`, callback: (oldVal: T[K], newVal: T[K]) => void): void
   * }
   * ```
   */
  //#region 由字段推导函数参数类型收缩过程 示例
  // 4.确定 TypeFuncExample 返回类型
  type funcExampleTypes<T> = {
    on<K extends string & keyof T>(eventName: `${K}Changed`, callback: (oldVal: T[K], newVal: T[K]) => void): void
  }

  // 3.声明函数 typeFuncExample
  declare function typeFuncExample<T>(options: T): funcExampleTypes<T>
  let typeFuncExampleOptions = {
    firstName: 'foo',
    lastName: 'bob',
    age: 26,
    info: {
      car: ''
    }
  }
  // 1.调用函数 typeFuncExample
  const typeFunc = typeFuncExample(typeFuncExampleOptions)
  // 2.调用typeFuncExample返回的回调方法on
  typeFunc.on('ageChanged', (oldVal, newVal) => {})
  //#endregion

  /**
   * @description 把一个对象变为不可变类型，即只读，TS原生readonly为浅只读，该工具深只读。
   * @typeParam T - 键值对形式的对象
   * @example
   * ```ts
   * type obj = {
   *   a?: '1'
   *   b?: {
   *     c?: 1
   *   }
   * }
   * // 所需类型来自属性 "a"，在此处的 "DeepReadonly<obj>" 类型上声明该属性
   * // 所需类型来自属性 "c"，在此处的 "DeepReadonly<{ c?: 1; }>" 类型上声明该属性
   * let d: DeepReadonly<obj> = {
   *   a: '2',
   *   b: {
   *     c: 2
   *   }
   * }
   * // 无法为“a”赋值，因为它是只读属性。
   * // 无法为“c”赋值，因为它是只读属性。
   * d.a = '2'
   * d.b.c = 2
   * ```
   * @group 类型工具
   */
  export type DeepReadonly<T extends Record<string | symbol | number, any>> = {
    readonly [K in keyof T]: DeepReadonly<T[K]>
  }
}
