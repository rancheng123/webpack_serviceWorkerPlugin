
//webpack 配置文件
module.exports = {
    //插件项
    plugins:[
        new testPlugin({
            //默认需要缓存的静态文件
            staticSourceArr:[
                '/',
                'api?v=2.0&ak=eRIBnvbWIPR5xxfUm2pIfM3GltzcqXkV',
                'code/mob-share.js'
            ],
            //输出一个service-worker文件
            output: 'H:/work/YYJC/Qianjia2/frontEnd/qianjia/dist/service-worker.js'

        })
    ],
    //页面入口文件配置
    entry: {

