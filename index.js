const PLUGIN_NAME = 'record-build-info-plugin'
const { execSync } = require('child_process')
const path = require('path')
const fs = require('fs')

class RecordBuildInfoPlugin {
  constructor (dir) {
    this.dir = dir || 'dist'
  }

  apply (compiler) {
    // 检测当前是不是git 环境
    if (!this._isGit()) {
      process.stdout.write(`${PLUGIN_NAME} 插件需要 git`)
      return
    }
    // 当前路径是否为git仓库路径
    if (this._parseStdout('git rev-parse --is-inside-work-tree') !== 'true') {
      process.stdout.write(`${PLUGIN_NAME} 插件通过 git 命令获取版本信息，当前路径为非 git 仓库路径`)
      return
    }

    if (compiler && compiler.hooks && compiler.hooks.done && compiler.hooks.done.tap) { // webpack 4.x
      compiler.hooks.done.tap(PLUGIN_NAME, () => {
        this._createRecord()
      })
    } else if (compiler && compiler.plugin) { // webpack 3.x
      compiler.plugin('done', () => {
        this._createRecord()
      })
    }
  }
  _isGit () {
    try {
      execSync('git --version', { stdio: 'ignore' })
      return true
    } catch (e) {
      return false
    }
  }
  _parseStdout (cmd) {
    try {
      let res = execSync(cmd, { stdio: 'pipe', encoding: 'utf8', cwd: process.cwd() })
      if (res.endsWith('\n')) {
        res = res.substring(0, res.length - 1)
      }
      return res
    } catch (error) {
      return ''
    }
  }
  _createRecord () {
    const p = path.join(this.dir, 'record-build-info.json')
    const info = this._getBuildInfo()
    fs.writeFileSync(p, JSON.stringify(info))
  }
  _getBuildInfo () {
    const barnch = this._parseStdout('git rev-parse --symbolic-full-name @{upstream}')
    const info = this._parseStdout('git show -s')
    const now = new Date()
    const buildTime = now.toLocaleDateString() + ' ' + now.toLocaleTimeString()
    return {
      barnch,
      buildTime,
      gitLast: info
    }
  }
}

module.exports = RecordBuildInfoPlugin
