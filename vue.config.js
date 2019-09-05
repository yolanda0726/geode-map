module.exports = {
    baseUrl: './',
    configureWebpack: {
        externals: {
            'AMap': 'AMap' // 高德地图配置
        }
    }
}