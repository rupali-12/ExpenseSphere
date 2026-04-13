import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { handleRequest, handleResponse, handleResponseError } from '@/api/axiosInstance'

describe('axiosInstance helpers', () => {
  // ─── handleRequest ───────────────────────────────────────────────────────
  describe('handleRequest', () => {
    it('returns config unchanged', () => {
      const config = { url: '/test', method: 'get', headers: {} }
      expect(handleRequest(config)).toBe(config)
    })

    it('handles config with extra properties intact', () => {
      const config = { url: '/users', method: 'post', data: { name: 'Alice' } }
      expect(handleRequest(config)).toEqual(config)
    })
  })

  // ─── handleResponse ──────────────────────────────────────────────────────
  describe('handleResponse', () => {
    it('returns response unchanged', () => {
      const response = { status: 200, data: { message: 'ok' } }
      expect(handleResponse(response)).toBe(response)
    })

    it('passes through error responses without modification', () => {
      const response = { status: 400, data: { message: 'bad request' } }
      expect(handleResponse(response)).toBe(response)
    })
  })

  // ─── handleResponseError ─────────────────────────────────────────────────
  describe('handleResponseError', () => {
    const originalLocation = window.location

    beforeEach(() => {
      // jsdom doesn't allow direct assignment to window.location so we delete and redefine
      Object.defineProperty(window, 'location', {
        configurable: true,
        writable: true,
        value: { href: '' },
      })
    })

    afterEach(() => {
      Object.defineProperty(window, 'location', {
        configurable: true,
        writable: true,
        value: originalLocation,
      })
    })

    it('redirects to /login on 401', async () => {
      const error = { response: { status: 401 } }
      await expect(handleResponseError(error)).rejects.toBe(error)
      expect(window.location.href).toBe('/login')
    })

    it('logs a console error on 500', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const error = { response: { status: 500 } }

      await expect(handleResponseError(error)).rejects.toBe(error)
      expect(consoleSpy).toHaveBeenCalledWith('Server error — please try again later')

      consoleSpy.mockRestore()
    })

    it('rejects with the original error for any status', async () => {
      const error = { response: { status: 403 }, message: 'Forbidden' }
      await expect(handleResponseError(error)).rejects.toBe(error)
    })

    it('does not redirect for non-401 errors', async () => {
      const error = { response: { status: 403 } }
      window.location.href = ''
      await expect(handleResponseError(error)).rejects.toBe(error)
      expect(window.location.href).toBe('')
    })

    it('handles missing response object gracefully', async () => {
      const error = { message: 'Network Error' }
      await expect(handleResponseError(error)).rejects.toBe(error)
      // should not throw, should not redirect
      expect(window.location.href).toBe('')
    })
  })
})