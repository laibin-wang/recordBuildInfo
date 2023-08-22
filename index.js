const { execSync } = require('child_process')
const path = require('path')
const fs = require('fs')

const PLUGIN_NAME = 'record-build-info-plugin'

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
    if (this._parseStdout('git rev-parse --is-inside-work-tree').trim() !== 'true') {
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
  _appendZero (num) {
    if (num < 10) {
      return `0${num}`
    }
    return num
  }
  _formatDate (time) {
    const year = time.getFullYear()
    const month = this._appendZero(time.getMonth() + 1)
    const date = this._appendZero(time.getDate())
    const week = '日一二三四五六'.charAt(time.getDay())
    const hour = this._appendZero(time.getHours())
    const minute = this._appendZero(time.getMinutes())
    const second = this._appendZero(time.getSeconds())
    return `${year}-${month}-${date}(周${week}) ${hour}:${minute}:${second}`
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
      let res = execSync(cmd, { encoding: 'utf8', cwd: process.cwd() })
      return res
    } catch (error) {
      return ''
    }
  }
  _createRecord () {
    const p = path.join(this.dir, 'record-build-info.json')
    const info = this._getBuildInfo()
    fs.writeFileSync(p, info)
  }
  _getBuildInfo () {
    const url = this._parseStdout('git ls-remote --get-url origin').split('/')
    const name = url[url.length - 1].replace(/\n|\r|.git/g, '')
    const commitId = this._parseStdout('git rev-parse HEAD').trim()
    const commitAuthor = this._parseStdout(`git log --pretty=format:%cn ${commitId} -1`).trim()
    const commitDate = this._parseStdout(`git log --pretty=format:%ci ${commitId} -1`).trim()
    const dateArr = commitDate.split(' ')
    dateArr.pop()
    const commitMsg  = this._parseStdout(`git log --pretty=format:%s  ${commitId} -1`).trim()
    let barnch  = this._parseStdout('git rev-parse --abbrev-ref HEAD').replace(/\s+/, '')
    if (barnch === 'HEAD') {
      barnch = this._parseStdout('git name-rev --name-only HEAD').replace(/\s+/, '')
    }
    const now = new Date()
    const buildTime = this._formatDate(now)
    const commitInfo = `
    - 最后一次信息:
    - 项目名称: ${name}
    - 项目分支: ${barnch}
    - 提交作者: ${commitAuthor}
    - 提交日期: ${dateArr.join(' ')}
    - commitId: ${commitId}
    - 提交描述: ${commitMsg}
    - 打包时间: ${buildTime}
    `
    return commitInfo
  }
  _getPackAageInfo () {
  }
}

module.exports = RecordBuildInfoPlugin
