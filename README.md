## 本项目使用方法
1. 服务器启动命令 `node server.js`
2. 爬虫模式(定时)启动参数 `crawler`
3. 爬虫模式立刻启动参数 `crawler`、`start`
4. 爬虫debug模式 `crawler`、`test`

本项目集成爬虫和转发服务器模块，转发服务器模块搭建请自行百度`nginx反向代理node服务器`

## 本项目技术栈
- 爬虫模块
1. Koa2与相关插件
2. Node-schedule定时模块
3. Headless-Chrome与puppeteer框架（如无法使用请安装chrome相关依赖）
4. Redis数据库

- 前端预测模块
1. Echarts图表库
2. Materializecss样式库
3. D3图形库
4. Papaparse数据解析库
5. Jquery
6. NumericJS数据处理库
7. NumsJS数据处理库
8. TensorflowJS深度学习库

## 本项目服务器最低配置要求

1 Core, 1GB RAM, 20M Network bandwidth