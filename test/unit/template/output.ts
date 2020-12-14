import * as chai from 'chai'
import { toThenable } from '../../../src/util/async'
import { Context } from '../../../src/context/context'
import { Output } from '../../../src/template/output'
import { OutputToken } from '../../../src/tokens/output-token'
import { FilterMap } from '../../../src/template/filter/filter-map'
import { defaultOptions } from '../../../src/liquid-options'

const expect = chai.expect

describe('Output', function () {
  const emitter: any = { write: (html: string) => (emitter.html += html), html: '' }
  const liquid = {} as any
  let filters: FilterMap
  beforeEach(function () {
    filters = new FilterMap(false, liquid)
    emitter.html = ''
  })

  it('should stringify objects', async function () {
    const scope = new Context({
      foo: { obj: { arr: ['a', 2] } }
    })
    const output = new Output({ content: 'foo' } as OutputToken, filters, liquid)
    await toThenable(output.render(scope, emitter))
    return expect(emitter.html).to.equal('[object Object]')
  })
  it('should skip function property', async function () {
    const scope = new Context({ obj: { foo: 'foo', bar: (x: any) => x } })
    const output = new Output({ content: 'obj' } as OutputToken, filters, liquid)
    await toThenable(output.render(scope, emitter))
    return expect(emitter.html).to.equal('[object Object]')
  })
  it('should respect to .toString()', async () => {
    const scope = new Context({ obj: { toString: () => 'FOO' } })
    const output = new Output({ content: 'obj' } as OutputToken, filters, liquid)
    await toThenable(output.render(scope, emitter))
    return expect(emitter.html).to.equal('FOO')
  })
  it('should respect to .toString()', async () => {
    const scope = new Context({ obj: { toString: () => 'FOO' } })
    const output = new Output({ content: 'obj' } as OutputToken, filters, liquid)
    await toThenable(output.render(scope, emitter))
    return expect(emitter.html).to.equal('FOO')
  })
  context('when keepOutputType is enabled', () => {
    const emitter: any = {
      write: (html: any) => {
        if (emitter.keepOutputType && typeof html !== 'string') {
          emitter.html = html
        } else {
          emitter.html += html as string
        }
      },
      html: '',
      keepOutputType: true
    }

    beforeEach(function () {
      filters = new FilterMap(false, liquid)
      emitter.html = ''
    })

    it('should respect output variable number type', async () => {
      const scope = new Context({
        foo: 42
      }, { ...defaultOptions, keepOutputType: true })
      const output = new Output({ content: 'foo' } as OutputToken, filters, liquid)
      await toThenable(output.render(scope, emitter))
      return expect(emitter.html).to.equal(42)
    })
    it('should respect output variable boolean type', async () => {
      const scope = new Context({
        foo: true
      }, { ...defaultOptions, keepOutputType: true })
      const output = new Output({ content: 'foo' } as OutputToken, filters, liquid)
      await toThenable(output.render(scope, emitter))
      return expect(emitter.html).to.equal(true)
    })
    it('should respect output variable object type', async () => {
      const scope = new Context({
        foo: 'test'
      }, { ...defaultOptions, keepOutputType: true })
      const output = new Output({ content: 'foo' } as OutputToken, filters, liquid)
      await toThenable(output.render(scope, emitter))
      return expect(emitter.html).to.equal('test')
    })
    it('should respect output variable string type', async () => {
      const scope = new Context({
        foo: { a: { b: 42 } }
      }, { ...defaultOptions, keepOutputType: true })
      const output = new Output({ content: 'foo' } as OutputToken, filters, liquid)
      await toThenable(output.render(scope, emitter))
      return expect(emitter.html).to.deep.equal({ a: { b: 42 } })
    })
  })
})
