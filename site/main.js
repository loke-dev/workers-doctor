const copyButton = document.querySelector('[data-copy]')

copyButton?.addEventListener('click', async () => {
  const value = copyButton.getAttribute('data-copy')
  if (!value) return
  await navigator.clipboard.writeText(value)
  const label = copyButton.querySelector('[data-copy-label]')
  if (label) {
    label.textContent = 'COPIED'
    window.setTimeout(() => {
      label.textContent = 'COPY'
    }, 1600)
  }
})

