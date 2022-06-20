# record-build-info-plugin
### install
``` shell
npm install record-build-info-plugin -D
yarn iadd record-build-info-plugin -D
pnpm install record-build-info-plugin -D
```

### webpack  使用方式

* Enable plugin in your webpack.base.js file:

``` javascript

const RecordBuildInfoPlugin = require('record-build-info-plugin')
module.exports = {
    plugins: [
            new RecordBuildInfoPlugin('dist')
        	...
        ]
}
```

* If using vue-cli

``` javascript
const RecordBuildInfoPlugin = require('record-build-info-plugin')  
configureWebpack: config => {
     config.plugins = [ 
         new RecordBuildInfoPlugin('dist'),
     	...]
 }
```



``` javascript
{ 
      barnch: 'build',             // 分支
      buildTime: '',			       // 打包时间
      gitLast: 'Administrator'           // 最后提交的记录
}
```

