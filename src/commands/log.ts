/*
 * @Description: 测试新命令
 * @Autor: yanpeng6@hikvision.com
 * @Date: 2022-01-22 13:54:51
 * @LastEditors: yanpeng6@hikvision.com
 * @LastEditTime: 2022-01-22 13:57:30
 */

const action = async (projectName: string, cmdArgs?: any) => {
  console.log('本项目名称为：', projectName)
}
export default {
    command: 'log <registry-name>',
    description: '打印出当前新项目名称',
    action,
}