import * as path from 'path'
import * as handlebars from 'handlebars'
import * as inquirer from 'inquirer'
import * as download from 'download-git-repo'
import {
  cwd,
  chalk,
  execa,
  fs,
  startSpinner,
  succeedSpiner,
  failSpinner,
  warn,
  info,
} from '../lib'

// 检查是否已经存在相同名字工程
export const checkProjectExist = async (targetDir) => {
  if (fs.existsSync(targetDir)) {
    const answer = await inquirer.prompt({
      type: 'list',
      name: 'checkExist',
      message: `\n仓库路径${targetDir}已存在，请选择`,
      choices: ['覆盖', '取消'],
    })
    if (answer.checkExist === '覆盖') {
      warn(`删除${targetDir}...`)
      fs.removeSync(targetDir)
    } else {
      return true
    }
  }
  return false
}

export const getQuestions = async (projectName) => {
  return await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: `请输入项目名称: (${projectName})`
    },
    {
        type: 'input',
        name: 'description',
        message: '请输入项目简介'
    },
    {
        type: 'input',
        name: 'author',
        message: '请输入作者姓名'
    },
    {
      type: 'list',
      name: 'webOrH5',
      message: 'webOrH5',
      choices: ['web', 'h5'],
    }
  ])
}

// 从Github上下载模板，不使用本地
export const cloneProject = async (targetDir, projectName, projectInfo) => {
  startSpinner(`开始创建私服仓库2 ${chalk.cyan(targetDir)}`)
  // 复制'project-template'到目标路径下创建工程
  await fs.copy(
    path.join(__dirname, '..', '..', 'project-template'),
    targetDir
  )

  // handlebars模版引擎解析用户输入的信息存在package.json
  const jsonPath = `${targetDir}/package.json`
  const jsonContent = fs.readFileSync(jsonPath, 'utf-8')
  const jsonResult = handlebars.compile(jsonContent)(projectInfo)
  fs.writeFileSync(jsonPath, jsonResult)

  // 新建工程装包
  execa.commandSync('npm install', {
    stdio: 'inherit',
    cwd: targetDir,
  })

  succeedSpiner(
    `私服仓库创建完成1 ${chalk.yellow(projectName)}\n👉 输入以下命令开启私服:`
  )

  info(`$ cd ${projectName}\n$ sh start.sh\n`)
}

const action = async (projectName: string, cmdArgs?: any) => {
  try {
    const targetDir = path.join(
      (cmdArgs && cmdArgs.context) || cwd,
      projectName
    )
    if (!(await checkProjectExist(targetDir))) {
      const projectInfo = await getQuestions(projectName)
      // await cloneProject(targetDir, projectName, projectInfo)
      console.log('选项', projectInfo)
      if ( projectInfo.webOrH5 === 'web' ) {
        console.log('暂不支持web端项目')
        return
      }
      startSpinner(`项目开始创建 ${chalk.cyan(targetDir)}`)
      await download('https://github.com:clumsybirdflying/templayte-H5#master', projectName, {clone: true}, err => {
        if ( err ) {
          failSpinner(err)
          console.log('模板下载失败')
          return 
        }
        console.log('模板下载成功1')
        const jsonPath = `${targetDir}/package.json`
        const jsonContent = fs.readFileSync(jsonPath, 'utf-8')
        const jsonResult = handlebars.compile(jsonContent)(projectInfo)
        fs.writeFileSync(jsonPath, jsonResult)
        succeedSpiner(
          `创建完成 ${chalk.yellow(projectName)}\n👉 输入以下命令开始项目:`
        )
      
        info(`$ cd ${projectName}\n$ npm install\n`)
      })
      // 新建工程装包
      // execa.commandSync('npm install', {
      //   stdio: 'inherit',
      //   cwd: targetDir,
      // })

    }
  } catch (err) {
    failSpinner(err)
    return
  }
}

export default {
  command: 'create <registry-name>',
  description: '创建一个H5项目',
  optionList: [['--context <context>', '上下文路径']],
  action,
}
