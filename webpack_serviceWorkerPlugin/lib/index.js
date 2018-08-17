/**
 * webpack插件开发采用'动态原型模式'
 * 插件开发，最重要的两个对象：compiler、compilation
 * @param options
 * @constructor
 */


function MyPlugin(options) { // 根据 options 配置你的插件
    this.options = options
}
// 我们可以在原型上添加一些方法
MyPlugin.prototype.someFunc = function() {/*something*/}

// apply方法是必须要有的，因为当我们使用一个插件时（new somePlugins({})），webpack会去寻找插件的apply方法并执行
MyPlugin.prototype.apply = function(compiler) {

    var that = this;

    //开始编译
    compiler.plugin("compile", function(params) {

        console.log("The compiler is starting to compile...");
    });

    // 编译进行中
    compiler.plugin("compilation", function(compilation) {

        console.log("The compiler is starting a new compilation...");

        // 当初始化后
        compilation.plugin("optimize", function() {
            console.log("The compilation is starting to optimize files...");
        });
    });

    // 当生成资源后
    compiler.plugin("emit", function(compilation, callback) {

        console.log("The compilation is going to emit files...");


        var staticSourceArr = that.options.staticSourceArr;

        var fileArr = [];


        // compilation.chunks是块的集合（构建后将要输出的文件，即编译之后得到的结果）
        compilation.chunks.forEach(function(chunk) {
            // chunk.modules是模块的集合（构建时webpack梳理出的依赖，即import、require的module）
            // 形象一点说：chunk.modules是原材料，下面的chunk.files才是最终的成品
            chunk.modules.forEach(function(module) {
                // module.fileDependencies就是具体的文件，最真实的资源【举例，在css中@import("reset.css")，这里的reset.css就是fileDependencie】
                if(module.fileDependencies){
                    module.fileDependencies.forEach(function(filepath) {
                        // 到这一步，就可以操作源文件了
                    });
                }

            });



            // 最终生成的文件的集合
            chunk.files.forEach(function(filename) {
                // source()可以得到每个文件的源码
                var source = compilation.assets[filename].source();

                if(!filename.match(/\.map/)){
                    fileArr.push(filename);
                }


            });
        });

        //统计到的缓存集合
        var fileStr = fileArr.concat(staticSourceArr).join(',');

        //生成service-worker文件

        var fs = require('fs');

        var path = require('path');
        var input = path.resolve(__dirname, '../client/service-worker.js');
        var output = that.options.output;

        fs.readFile(input,'utf-8',function(error,data){
            if(error){
                console.log(error);
                return;
            }
            console.log(data);

            var newData = data.replace(/\{\{cacheList\}\}/,fileStr).replace(/\{\{version\}\}/,Date.now());

            //创建文件
            fs.open(output,'w',function(error,fd){
                if(error){
                    console.log(error);
                    return;
                }

                //写入文件(异步)
                fs.writeFile(output,newData,'utf-8',function(error){
                    if(error){
                        console.log(error);
                        return;
                    }else{
                        console.log('文件生成成功')
                    }
                });

            })

        });



        // callback在最后必须调用
        callback();
    });
};

// 以上compiler和compilation的事件监听只是一小部分，详细API可见该链接http://www.css88.com/doc/webpack2/api/plugins/

module.exports = MyPlugin;