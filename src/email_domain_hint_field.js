const _ = require('lib/underscore')
const $ = require('lib/jquery')
const styles = require('./email_domain_hint_field.less')
const log = require('log').create('hintfield') // eslint-disable-line
require('keyboardevent-key-polyfill').polyfill()

const defaults = {
    hint: '',
    classNames: {
        clone: 'email-domain-hint-field-clone',
        original: 'email-domain-hint-field-original',
    },
}

class EmailDomainHintField {

    constructor($el, options = {}) {
        this.cid = _.uniqueId('hintfield')
        this.$input = $el
        this.input = $el.get(0)
        this.options = $.extend({}, defaults, options)

        _.bindAll(this, ...[
            'addClone',
            'onDomNodeRemoved',
            'onKeyDown',
            'matchStyle',
            'copyValue',
            'deferredCopyValue',
        ])

        this.initialize()
        this.removeStyles = styles._insertCss()
    }

    initialize() {
        this.addClone()
        this.matchStyle()
        this.copyValue()
        this.addListeners()
    }
    addClone() {
        this.$clone = this.$input.clone().addClass(this.options.classNames.clone).removeAttr('id')
        this.$input.addClass(this.options.classNames.original).before(this.$clone)
        this.clone = this.$clone.get(0)
    }
    matchStyle() {
        const style = getComputedStyle(this.input)
        const height = parseInt(style.getPropertyValue('height'), 10)
        const marginTop = parseInt(style.getPropertyValue('margin-top'), 10)
        const offset = height + marginTop
        this.$clone.css({
            'margin-bottom': `-${offset}px`,
        })
    }
    addListeners() {
        document.body.addEventListener('DOMNodeRemoved', this.onDomNodeRemoved)
        this.input.addEventListener('keydown', this.onKeyDown)
        this.input.addEventListener('keyup', this.copyValue)
        this.input.addEventListener('cut', this.deferredCopyValue)
        this.input.addEventListener('paste', this.deferredCopyValue)
    }
    onDomNodeRemoved(e) {
        const isInput = (e.target === this.input)
        const containsInput = ($.contains(e.target, this.input))
        if (isInput || containsInput) this.destroy()
    }

    onKeyDown(e) {
        // ignore modified key events
        if (e.ctrlKey || e.metaKey) {
            return
        }

        if (
            e.key.length === 1
            && this.input.maxLength > -1
            && this.input.value.length >= this.input.maxLength
        ) {
            return
        }

        this.clone.value = this.getNewValue(e, this.input) + this.options.hint
    }
    getNewValue(e, input) {
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

    copyValue() {
        this.clone.value = this.input.value + this.options.hint
    }
    deferredCopyValue() {
        setTimeout(this.copyValue, 10)
    }

    destroy() {
        this.removeListeners()
        this.$clone.remove()
        this.removeStyles()
        this.$input.removeData('hintfield')
    }
    removeListeners() {
        document.body.removeEventListener('DOMNodeRemoved', this.onDomNodeRemoved)
        this.input.removeEventListener('keydown', this.onKeyDown)
        this.input.removeEventListener('keyup', this.copyValue)
        this.input.removeEventListener('cut', this.deferredCopyValue)
        this.input.removeEventListener('paste', this.deferredCopyValue)
    }

}


$.fn.email_domain_hint_field = function applyEmailDomainHintField(options) {
    return this.each(function each() {
        const $el = $(this)
        $el.data('email_domain_hint_field', new EmailDomainHintField($el, options))
    })
}

module.exports = EmailDomainHintField
