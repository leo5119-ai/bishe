# 附录A 项目目录结构与文件清单

## A.1 项目总体结构

```
seats_resevation/
├── miniprogram/                      # 小程序前端目录
├── cloudfunctions/                   # 云函数目录
└── floor-plan-redesign/              # 旧版楼层图（已废弃）
```

## A.2 小程序前端结构（miniprogram/）

```
miniprogram/
├── app.js                            # 应用入口文件
├── app.json                          # 全局配置（页面路由、tabBar、组件注册）
├── app.wxss                          # 全局样式文件
├── envList.js                        # 云环境配置
├── sitemap.json                      # 小程序 sitemap 配置
├── package.json                      # npm 依赖配置文件
├── package-lock.json                  # npm 依赖锁定文件
│
├── pages/                            # 页面目录（7个页面）
│   ├── login/                         # 登录页
│   │   ├── login.js                   # 登录逻辑
│   │   ├── login.wxml                 # 页面结构
│   │   ├── login.wxss                 # 页面样式
│   │   └── login.json                 # 页面配置
│   │
│   ├── index/                         # 首页（TabBar页面）
│   │   ├── index.js                   # 首页逻辑（轮播图、统计加载）
│   │   ├── index.wxml                 # 页面结构
│   │   ├── index.wxss                 # 页面样式
│   │   └── index.json                 # 页面配置
│   │
│   ├── floor-plan/                    # 楼层平面图页
│   │   ├── floor-plan.js              # 楼层图逻辑（座位渲染、状态切换）
│   │   ├── floor-plan.wxml            # 页面结构
│   │   ├── floor-plan.wxss            # 页面样式
│   │   └── floor-plan.json            # 页面配置
│   │
│   ├── reservation-detail/            # 预约详情页
│   │   ├── reservation-detail.js      # 预约逻辑（时间选择、冲突检测）
│   │   ├── reservation-detail.wxml    # 页面结构
│   │   ├── reservation-detail.wxss    # 页面样式
│   │   └── reservation-detail.json    # 页面配置
│   │
│   ├── myReservations/               # 我的预约页（TabBar页面）
│   │   ├── index.js                   # 预约列表逻辑（签到、取消、结束）
│   │   ├── index.wxml                 # 页面结构
│   │   ├── index.wxss                 # 页面样式
│   │   └── index.json                 # 页面配置
│   │
│   ├── profile/                       # 个人中心页（TabBar页面）
│   │   ├── index.js                   # 个人中心逻辑（信用分、统计）
│   │   ├── index.wxml                 # 页面结构
│   │   ├── index.wxss                 # 页面样式
│   │   └── index.json                 # 页面配置
│   │
│   └── admin/                         # 管理后台页
│       ├── index.js                   # 管理后台逻辑（座位管理、用户管理）
│       ├── index.wxml                 # 页面结构
│       ├── index.wxss                 # 页面样式
│       └── index.json                 # 页面配置
│
├── images/                           # 静态图片资源
│   ├── test1.jpg                     # 轮播图1（系统介绍）
│   ├── test2.jpg                     # 轮播图2
│   ├── test3.jpg                     # 轮播图3（图书馆照片）
│   ├── CheckInCode.png               # 签到二维码示例
│   └── icons/                        # TabBar图标
│       ├── home.png                  # 首页图标
│       ├── home-active.png           # 首页选中图标
│       ├── goods.png                 # 预约图标
│       ├── goods-active.png          # 预约选中图标
│       ├── usercenter.png            # 个人中心图标
│       └── usercenter-active.png     # 个人中心选中图标
│
├── utils/                            # 工具函数目录
│   └── floorData.js                  # 楼层配置数据
│
├── components/                       # 自定义组件目录（预留）
│
├── miniprogram_npm/                  # Vant Weapp 组件库（npm构建）
│   └── @vant/weapp/                  # Vant 组件源码
│
└── node_modules/                     # npm 依赖包
    └── @vant/weapp/                  # Vant Weapp npm 版本
```

## A.3 云函数结构（cloudfunctions/）

```
cloudfunctions/                       # 云函数目录（12个云函数）
│
├── getOpenId/                        # 获取用户openid
│   ├── index.js                      # 云函数入口
│   └── package.json                  # 依赖配置
│
├── login/                            # 登录验证
│   ├── index.js                      # 云函数入口
│   ├── package.json                  # 依赖配置
│   └── node_modules/                 # 依赖包
│
├── createReservation/                 # 创建预约
│   ├── index.js                      # 云函数入口（时段冲突检测、信用分校验）
│   └── package.json                  # 依赖配置
│
├── cancelReservation/                 # 取消预约
│   ├── index.js                      # 云函数入口
│   └── package.json                  # 依赖配置
│
├── checkIn/                          # 签到确认
│   ├── index.js                      # 云函数入口（迟到判定、信用分奖惩）
│   └── package.json                  # 依赖配置
│
├── endReservation/                    # 结束使用
│   ├── index.js                      # 云函数入口
│   └── node_modules/                 # 依赖包
│
├── autoExpireReservations/            # 自动过期处理
│   ├── index.js                      # 云函数入口（超时未签到检测）
│   └── package.json                  # 依赖配置
│
├── getAllSeats/                      # 获取所有座位
│   ├── index.js                      # 云函数入口
│   └── package.json                  # 依赖配置
│
├── updateSeatStatus/                  # 更新座位状态
│   ├── index.js                      # 云函数入口（设为维护/恢复正常）
│   └── package.json                  # 依赖配置
│
├── initSeats/                        # 初始化座位数据
│   ├── index.js                      # 云函数入口（160个座位初始化）
│   └── package.json                  # 依赖配置
│
├── initDatabase/                      # 初始化数据库集合
│   ├── index.js                      # 云函数入口（创建集合、管理员账户）
│   └── package.json                  # 依赖配置
│
└── generateCheckinCode/              # 生成签到二维码
    ├── index.js                      # 云函数入口
    └── package.json                  # 依赖配置
```

## A.4 目录结构说明

### A.4.1 页面文件结构规范

每个页面目录下包含以下四类文件：

| 文件类型 | 后缀 | 说明 |
|---------|------|------|
| 结构文件 | .wxml | 页面模板，定义页面结构（类似HTML） |
| 逻辑文件 | .js | 页面逻辑，处理用户交互与数据（必需） |
| 样式文件 | .wxss | 页面样式，定义组件外观（类似CSS） |
| 配置文件 | .json | 页面配置，配置页面标题、组件引用等 |

### A.4.2 云函数结构规范

每个云函数目录下包含以下文件：

| 文件类型 | 后缀 | 说明 |
|---------|------|------|
| 入口文件 | index.js | 云函数入口，包含exports.main函数 |
| 依赖配置 | package.json | 依赖声明，定义wx-server-sdk等依赖 |

### A.4.3 TabBar页面配置

小程序底部TabBar包含3个页面：

| TabBar页面 | 页面路径 | 功能说明 |
|-----------|---------|---------|
| 首页 | pages/index/index | 轮播图、座位统计、楼层入口 |
| 我的预约 | pages/myReservations/index | 今日预约、历史记录、签到/取消/结束 |
| 个人中心 | pages/profile/index | 信用分展示、统计数据、功能入口 |

## A.5 数据库集合

本系统云数据库包含以下集合：

| 集合名称 | 说明 | 主键 |
|---------|------|------|
| users | 用户信息集合 | openid |
| seats | 座位信息集合 | seatId |
| reservations | 预约记录集合 | _id（系统自动生成） |

集合详情见本文档第3章"数据库设计"部分。

## A.6 技术栈汇总

| 类别 | 技术名称 | 版本/说明 |
|-----|---------|----------|
| 前端框架 | 微信小程序 | 原生框架（WXML/WXSS/JavaScript） |
| UI组件库 | Vant Weapp | npm 版本 |
| 云服务 | 微信云开发 | CloudBase（BaaS架构） |
| 云函数Runtime | Node.js | 云函数环境 |
| 数据库 | 云数据库 | MongoDB风格NoSQL |
| 构建工具 | npm | 依赖管理 |
| 开发工具 | 微信开发者工具 | 调试与预览 |
