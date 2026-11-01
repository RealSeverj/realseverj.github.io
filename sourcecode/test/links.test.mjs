import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const publicLinks = new URL('../public/links.json', import.meta.url)
const repoLinks = new URL('../../links.json', import.meta.url)

test('根 links.json 与 sourcecode/public/links.json 内容一致', async () => {
  const [published, source] = await Promise.all([
    readFile(repoLinks, 'utf8').then(JSON.parse),
    readFile(publicLinks, 'utf8').then(JSON.parse),
  ])
  assert.deepEqual(published, source)
})

test('links.json 的 section 结构完整', async () => {
  const { sections } = JSON.parse(await readFile(publicLinks, 'utf8'))
  assert.ok(Array.isArray(sections) && sections.length > 0)
  assert.deepEqual(
    sections.map(section => section.id),
    ['site', 'friends', 'articles'],
  )

  for (const section of sections) {
    assert.equal(typeof section.title, 'string', section.id)
    assert.ok(Array.isArray(section.links) && section.links.length > 0, section.id)
    for (const link of section.links) {
      // 文章用 title 作为展示名，普通入口用 label
      const name = section.id === 'articles' ? link.title : link.label
      assert.equal(typeof name, 'string', section.id)
      assert.match(link.href, /^(\/|https?:\/\/)/, `${section.id}: ${name}`)
    }
  }
})
