const $ = require('lib/jquery')
require('module/hint_field/hint_field_plugin')
const log = require('testlib/log') // eslint-disable-line

const styles = require('app/app.less')
styles._insertCss()

const markup = `
    <input id="input1" type="text" class="input large fullwidth" value="abcdef" />
`

const node = document.createElement('div')
node.style.padding = '20px'
node.innerHTML = markup
document.body.appendChild(node)

$('#input1').hintfield({
    hint: '@pascal.com',
})
