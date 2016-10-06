describe('module/email_domain_hint_field:', function() {
    const chai = require('chai')
    const expect = chai.expect // eslint-disable-line
    const should = chai.should() // eslint-disable-line
    const sinon = require('sinon') // eslint-disable-line
    const log = require('testlib/log') // eslint-disable-line
    const testEventCount = require('testlib/test_event_count') // eslint-disable-line

    const styles = require('app/app.less')
    const $ = require('lib/jquery')
    const HintField = require('../src/email_domain_hint_field.js')

    // jquery attrs plugin
    // $(selector).attrs() => get all attributes
    // $(selector).attrs({...}) => set {...} attributes
    $.fn.attrs = function(attrs) {
        const t = $(this)
        if (attrs) {
            // Set attributes
            t.each(function(i, e) {
                const j = $(e)
                Object.keys(attrs).forEach(attr => {
                    j.attr(attr, attrs[attr])
                })
            })
            return t
        }
        // Get attributes
        const a = {}
        const r = t.get(0)
        if (r) {
            const r_attrs = Array.prototype.slice.call(r.attributes)
            r_attrs.forEach(attr => {
                if (typeof attr.nodeValue !== 'undefined') a[attr.nodeName] = attr.nodeValue
            })
        }
        return a
    }

    const markup = `
        <div style="padding:20px">
            <input type="text" value="pascal" class="input large fullwidth" maxlength="30">
        </div>
    `

    let node
    let $input
    let instance

    before(function() {
        this.removeStyles = styles._insertCss()
    })
    after(function() {
        this.removeStyles()
    })

    function create() {
        node = $(markup).appendTo('body')
        $input = node.find('input')
    }
    function destroy() {
        instance = null
        node.remove()
    }

    function createUsingPlugin() {
        create()
        $input.email_domain_hint_field({
            hint: '@about.me',
        })
    }
    function createUsingClass() {
        create()
        instance = new HintField($input, {
            hint: '@about.me',
        })
    }

    describe('HintField', function() {
        it('should be a class', function() {
            should.exist(HintField)
            HintField.should.be.a('function')
            HintField.prototype.constructor.should.be.a('function')
        })

        describe('HintField instance', function() {
            before(function() {
                sinon.spy(HintField.prototype, 'destroy')
                createUsingClass()
            })
            after(function() {
                destroy()
            })
            describe('instance.$input', function() {
                it('should exist', function() {
                    instance.$input.length.should.equal(1)
                })
                it('should be same as original input', function() {
                    instance.$input.should.equal($input)
                })
            })
            describe('instance.$clone', function() {
                it('should exist', function() {
                    instance.$clone.length.should.equal(1)
                })
                it('should have className `email-domain-hint-field-clone`', function() {
                    instance.$clone.hasClass('email-domain-hint-field-clone').should.be.true
                })
                it('should have same classNames as input, except `email-domain-hint-field-original`', function() {
                    const classNames = (
                        instance.$input.attr('class')
                        .split(' ')
                        .map(name => name.trim())
                        .filter(name => name !== 'email-domain-hint-field-original')
                    )
                    classNames.forEach(name => {
                        instance.$clone.hasClass(name).should.be.true
                    })
                })
                it('should have same attrs as input, except `id` and `class`', function() {
                    const attrs = instance.$input.attrs()
                    delete attrs.id
                    delete attrs.class
                    Object.keys(attrs).forEach(name => {
                        instance.$clone.attr(name).should.equal(attrs[name])
                    })
                })
            })
            describe('when input is removed from DOM', function() {
                before(function() {
                    destroy()
                })
                it('should destroy itself', function() {
                    HintField.prototype.destroy.called.should.be.true
                })
            })
        })
    })

    describe('$.fn.email_domain_hint_field', function() {
        it('should be a function', function() {
            should.exist($.fn.email_domain_hint_field)
            $.fn.email_domain_hint_field.should.be.a('function')
        })

        describe('$input.email_domain_hint_field(options)', function() {
            before(function() {
                createUsingPlugin()
            })
            after(function() {
                destroy()
            })
            it('should create HintField class in $input.data', function() {
                const data_ref = $input.data('email_domain_hint_field')
                should.exist(data_ref)
                data_ref.should.be.instanceof(HintField)
            })
        })

    })

    describe('event count', function() {
        let count = 0
        before(function() {
            const ael = Node.prototype.addEventListener
            sinon.stub(Node.prototype, 'addEventListener', function addEventListener() {
                count++
                ael.apply(this, arguments)
            })
            const rel = Node.prototype.removeEventListener
            sinon.stub(Node.prototype, 'removeEventListener', function removeEventListener() {
                count--
                rel.apply(this, arguments)
            })
        })
        describe('created with class', function() {
            before(function() {
                count = 0
                createUsingClass()
                expect(count > 0).to.be.true
                destroy()
            })
            it('should remove events', function() {
                count.should.equal(0)
            })
        })
        describe('created with plugin', function() {
            before(function() {
                count = 0
                createUsingPlugin()
                expect(count > 0).to.be.true
                destroy()
            })
            it('should remove events', function() {
                count.should.equal(0)
            })
        })
    })

})
