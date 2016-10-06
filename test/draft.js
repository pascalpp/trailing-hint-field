require('keyboardevent-key-polyfill').polyfill()
const log = require('testlib/log') // eslint-disable-line

const markup = `
    <input id="input1" type="text" value="abcdef" maxlength="10" />
    <input id="input2" type="text" value="abcdef" />
`

const node = document.createElement('div')
node.innerHTML = markup

document.body.appendChild(node)

const input1 = node.querySelector('#input1')
const input2 = node.querySelector('#input2')

function getNewValue(e, input) {
    const key = e.key

    // get characters to left of selection start
    let prefix = input.value.slice(0, input.selectionStart)
    // get characters in selection
    let selection = input.value.slice(input.selectionStart, input.selectionEnd)
    // get characters to right of selection end
    let suffix = input.value.slice(input.selectionEnd)
    // text to insert between prefix and suffix

    switch (key) {
        case 'Backspace':
            // if there's no selection, remove one character to left
            if (! selection) prefix = prefix.slice(0, -1)
            // remove selection regardless
            selection = ''
            break
        case 'Delete':
            // if there's no selection, remove one character to right
            if (! selection) suffix = suffix.slice(1)
            // remove selection regardless
            selection = ''
            break
        default:
            // if key is a single letter, insert that at insertion point
            if (key.length === 1) selection = key
            break
    }

    return `${prefix}${selection}${suffix}`
}

input1.addEventListener('keydown', (e) => {
    // ignore modified key events
    if (e.ctrlKey || e.metaKey) return

    if (
        e.key.length === 1
        && input1.maxLength > -1
        && input1.value.length >= input1.maxLength
    ) return

    // use keydown event to figure out what new input value will be
    // account for cursor position, selection range, backspace/delete key
    input2.value = getNewValue(e, input1)
})
function deferredCopyValue(inputA, inputB) {
    setTimeout(() => {
        inputB.value = inputA.value
    }, 1)
}
input1.addEventListener('cut', (e) => {
    deferredCopyValue(input1, input2)
})
input1.addEventListener('paste', (e) => {
    deferredCopyValue(input1, input2)
})

input1.addEventListener('keyup', (e) => {
    if (e.ctrlKey || e.metaKey) return
    // by the time keyup fires, both inputs should have same value
    // console.assert(input2.value === input1.value)
})

input2.addEventListener('keydown', (e) => {
    log('input2', e.code, e.key, e)
})


window.o = {
    input1,
    input2,
}
