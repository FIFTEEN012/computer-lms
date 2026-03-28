import { Node, mergeAttributes } from '@tiptap/core'

export const CodePlaygroundNode = Node.create({
  name: 'codePlayground',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      language: { default: 'python' },
      starterCode: { default: '' },
      instructions: { default: '' },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-code-playground]',
        getAttrs: (el) => {
          const dom = el as HTMLElement
          return {
            language: dom.getAttribute('data-language') || 'python',
            starterCode: dom.getAttribute('data-starter-code') || '',
            instructions: dom.getAttribute('data-instructions') || '',
          }
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-code-playground': 'true',
        'data-language': HTMLAttributes.language,
        'data-starter-code': HTMLAttributes.starterCode,
        'data-instructions': HTMLAttributes.instructions,
      }),
      [
        'pre',
        {},
        [
          'code',
          {},
          `// [CODE PLAYGROUND: ${(HTMLAttributes.language || 'python').toUpperCase()}]`,
        ],
      ],
    ]
  },

  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement('div')
      dom.classList.add(
        'border', 'border-primary-fixed/30', 'bg-surface-container-low',
        'p-4', 'my-4', 'relative', 'select-none'
      )
      dom.contentEditable = 'false'

      let decodedInstructions = ''
      try {
        if (node.attrs.instructions) {
          decodedInstructions = decodeURIComponent(escape(atob(node.attrs.instructions)))
        }
      } catch { /* ignore */ }

      dom.innerHTML = `
        <div class="flex items-center gap-3 mb-2">
          <div class="w-8 h-8 bg-primary-fixed/10 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-primary-fixed"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </div>
          <div>
            <div class="font-headline text-xs text-primary-fixed tracking-widest uppercase font-bold">CODE PLAYGROUND</div>
            <div class="font-label text-[10px] text-outline tracking-widest uppercase">${(node.attrs.language || 'python').toUpperCase()} — Interactive</div>
          </div>
        </div>
        ${decodedInstructions ? `<div class="text-xs text-on-surface-variant border-t border-white/5 pt-2 mt-2">${decodedInstructions}</div>` : ''}
        <div class="text-[10px] text-outline/40 mt-2 font-mono">นักเรียนจะเห็น Code Editor ตรงนี้</div>
      `
      return { dom }
    }
  },
})
