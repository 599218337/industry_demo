/*
 * @Descripttion: 管理实体模型：创建、销毁
 * @version: 1.0
 * @Author: hejin.gao
 * @Date: 2019-09-20 09:32:21
 * @LastEditors: YangYuzhuo
 * @LastEditTime: 2023-09-07 16:00:09
 */
import * as Cesium from 'cesium'
import { common } from '../util/common';

/* eslint-disable */
export default class Entitys {
    entitysAction: any
    constructor(core: any) {
        /**
         * 初始化
         */
        this.entitysAction = core.entities;

    }
    add(entity: any) {
        return this.entitysAction.add(entity);
    }
    remove(entity: any) {
        this.entitysAction.remove(entity);
    }
    removeAll() {
        this.entitysAction.removeAll();
    }
    createEntity() {
        return new Cesium.Entity();
    }
    //点
    getPoint() {
        return new Cesium.PointGraphics({
            color: Cesium.Color.GREEN,
            pixelSize: 5,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 1
        });
    }
    //线
    getLine(positions: any, color: any, clampToGround = true) {
        return new Cesium.PolylineGraphics({
            show: true,
            positions: positions,
            material: color,
            width: 1,
            clampToGround: clampToGround
        });
    }
    //标签
    getLabel(text: any, offset?: any) {
        return new Cesium.LabelGraphics({ //文字标签
            text: text,
            font: '14px sans-serif',
            fillColor: Cesium.Color.GOLD,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            outlineWidth: 2,
            showBackground: true,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: offset == undefined ? new Cesium.Cartesian2(0, 20) : offset,
            disableDepthTestDistance: 1000.0
            //heightReference:Cesium.HeightReference.RELATIVE_TO_GROUND
        });
    }
    //广告牌
    getBillboard(img?: any, width?: any, height?: any) {
        return new Cesium.BillboardGraphics({
            image: img == undefined ? '../img/zb.png' : img,
            width: width == undefined ? 35 : width,
            height: height == undefined ? 35 : height,
            // clampToGround: true,
            // eyeOffset :new Cesium.Cartesian2(-200, 0),
            pixelOffset: new Cesium.Cartesian2(0, -20),
            //heightReference:Cesium.HeightReference.RELATIVE_TO_GROUND
        })
    }
    //路径
    getPath() {
        return new Cesium.PathGraphics({
            resolution: 1,
            material: new Cesium.PolylineGlowMaterialProperty({
                glowPower: 0.1,
                color: Cesium.Color.YELLOW,
            }),
            width: 5,
        })
    }
    //模型
    getModel(e: any) {
        return new Cesium.ModelGraphics({
            uri: e.url,
            scale: 6,
            minimumPixelSize: 64
        })
    }
    //圆
    getEllipse(opt: any) {
        let r = opt.r == undefined ? 1000000.0 : opt.r;
        new Cesium.EllipseGraphics({
            semiMajorAxis: opt.r,
            semiMinorAxis: opt.r,
            material: Cesium.Color.RED.withAlpha(0.5),
            outline: true
        })
    }
    //球
    getEllipsoid(opt: any) {
        let r = opt.r == undefined ? 1000000.0 : opt.r;  //默认100公里
        return new Cesium.EllipsoidGraphics({
            radii: new Cesium.Cartesian3(r, r, r), //单位 米
            //innerRadii : new Cesium.Cartesian3(100000.0, 80000.0, 60000.0),
            maximumCone: Cesium.Math.PI_OVER_TWO,
            stackPartitions: 56,
            slicePartitions: 56,
            outlineWidth: 2.0,
            outlineColor: Cesium.Color.YELLOW,
            material: Cesium.Color.RED.withAlpha(0.1),
            //heightReference:Cesium.HeightReference.NONE,
            outline: true
        });
    }
    //创建点信息
    createPoint(cartesian: any, label = false, point = false, billboard = false) {
        let entity = this.createEntity();
        entity.position = cartesian;
        if (point) entity.point = this.getPoint();
        if (billboard) entity.billboard = this.getBillboard(billboard);
        if (label) entity.label = this.getLabel(label);
        let entityPoint = this.add(entity);
        return entityPoint;
    }
    //创建线
    createLine(positions: any, oid = "", color = Cesium.Color.CHARTREUSE) {
        let entity: any = this.createEntity();
        entity.position = positions;
        entity.polyline = this.getLine(positions, color, false);
        entity.oid = oid;
        return this.add(entity);
    }

    //自定义雷达
    getCustomRadar(l: any, r: any) {
        return {
            // position: l,
            // orientation: Cesium.Transforms.headingPitchRollQuaternion(l, r),
            // rectangularSensor: new Cesium.RectangularSensorGraphics({
            //     radius: 380000,
            //     xHalfAngle: Cesium.Math.toRadians(50),
            //     yHalfAngle: Cesium.Math.toRadians(50),
            //     material: new Cesium.Color(0, 1, 1, .4),
            //     lineColor: new Cesium.Color(0, 1, 1, 1),
            //     showScanPlane: true,
            //     scanPlaneColor: new Cesium.Color(0, 1, 1, 1),
            //     scanPlaneMode: "vertical",
            //     scanPlaneRate: 3,
            //     showThroughEllipsoid: !1
            // })
        }
    }
    /**
   * 提示信息实体
   * createMsgTip
   * showTip 控制器
   */
    createMsgTip() {
        let _tipId = 'msg-tip-tool';
        let _resultTip = this.entitysAction.getById(_tipId);
        if (!_resultTip) {
            _resultTip = this.entitysAction.add({
                id: _tipId,
                name: '鼠标提示信息实体',
                label: {
                    fillColor: Cesium.Color.YELLOW,
                    showBackground: true,
                    font: '14px monospace',
                    horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    pixelOffset: new Cesium.Cartesian2(15, 20),
                    disableDepthTestDistance: Number.POSITIVE_INFINITY
                }
            });
        }
        return _resultTip;
    }
    /**
    * 提示框
    * @param {*} bShow
    * @param {*} position
    * @param {*} message
    */
    showTip(label: any, bShow: any, position: any, message: any, effectOptions: any) {
        label.show = bShow;
        if (bShow) {
            if (position)
                label.position = position;
            if (message)
                label.label.text = message;
            if (effectOptions) {
                for (let key in effectOptions) {
                    if (label.key) {
                        label.key = effectOptions[key];
                    }
                }
            }
        }
    }
    /**
     * 绘制各种类型的点
     * @param {*} viewer
     * @param {*} position
     * @param {*} size
     * @param {*} color
     * @param {*} id
     */
    drawPoint(position: any, size = 1, color = Cesium.Color.GREEN, _id = null) {
        if (position instanceof Array) {
            position = Cesium.Cartesian3.fromDegrees(position[0], position[1], position[2] ? position[2] : 0);
        }
        let options = {
            id: _id || common.getUuid(11),
            position: position,
            point: {
                pixelSize: size,
                color: color
            }
        };
        return this.entitysAction.add(options);
    }
    /**
     * 绘制各种类型的线
     * @param {*} viewer
     * @param {*} positons
     * @param {*} color
     * @param {*} depthColor
     */
    drawLine(positons: any, color: any, depthColor: any) {
        return this.entitysAction.add({
            polyline: {
                positions: positons,
                width: 2,
                material: new Cesium.PolylineOutlineMaterialProperty({
                    color: color || Cesium.Color.GREEN,
                    outlineWidth: 1,
                    outlineColor: color || Cesium.Color.GREEN
                }),
                depthFailMaterial: depthColor
                    ? new Cesium.PolylineOutlineMaterialProperty({
                        color: depthColor,
                        outlineWidth: 0,
                        outlineColor: depthColor
                    })
                    : undefined
            }
        });
    }
}