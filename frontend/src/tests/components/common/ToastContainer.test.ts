import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { useSessionStore } from '@/stores/sessionStore'
import { nextTick } from 'vue'
import ToastContainer from '@/components/common/ToastContainer.vue'

const mountToast = () => {
  return mount(ToastContainer, {
    attachTo: document.body,
    global: {
      plugins: [
        createTestingPinia({
          stubActions: false, 
        }),
      ],
    },
  })
}

beforeEach(() => {
  document.body.innerHTML = ''
})

afterEach(() => {
  document.body.innerHTML = ''
})

describe('ToastContainer.vue', () => {
  it('renders toast when store has toasts', async () => {
    mountToast()
    const store = useSessionStore()

    store.toasts.push({
      id: 1,
      type: 'success',
      message: 'Saved successfully',
    })

    await nextTick()

    expect(document.body.textContent).toContain('Saved successfully')
  })

  it('renders correct icon for success toast', async () => {
    mountToast()
    const store = useSessionStore()

    store.toasts.push({
      id: 2,
      type: 'success',
      message: 'Success!',
    })

    await nextTick()

    expect(document.body.querySelector('svg')).toBeTruthy()
  })

  it('applies correct styles based on toast type', async () => {
    mountToast()
    const store = useSessionStore()

    store.toasts.push({
      id: 3,
      type: 'error',
      message: 'Something went wrong',
    })

    await nextTick()

    const toast = document.body.querySelector('.border') as HTMLElement
    expect(toast.className).toContain('border-[#DC2626]')
  })

  it('removes toast when close button is clicked', async () => {
    mountToast()
    const store = useSessionStore()

    store.toasts.push({
      id: 4,
      type: 'info',
      message: 'Info message',
    })

    await nextTick()

    const closeBtn = document.body.querySelector('button') as HTMLElement
    await closeBtn.click()
    await nextTick()

    expect(store.toasts.length).toBe(0)
  })

  it('renders multiple toasts', async () => {
    mountToast()
    const store = useSessionStore()

    store.toasts.push(
      { id: 1, type: 'success', message: 'Success' }
    )
    store.toasts.push(
      { id: 2, type: 'error', message: 'Error' }
    )
    store.toasts.push(
      { id: 3, type: 'warning', message: 'Warning' }
    )

    await nextTick()

    expect(document.body.textContent).toContain('Success')
    expect(document.body.textContent).toContain('Error')
    expect(document.body.textContent).toContain('Warning')
  })
})