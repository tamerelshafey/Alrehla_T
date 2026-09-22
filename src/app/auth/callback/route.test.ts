import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from './route'

const exchangeCodeForSession = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: () =>
    Promise.resolve({
      auth: {
        exchangeCodeForSession: (...args: unknown[]) => exchangeCodeForSession(...args),
      },
    }),
}))

describe('Auth Callback Route GET', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    exchangeCodeForSession.mockResolvedValue({ error: null })
  })

  it('يعيد التوجيه إلى المسار الداخلي الصالح عند نجاح تسجيل الدخول', async () => {
    const request = new Request(
      'https://alrehla.app/auth/callback?code=test-code&next=/dashboard/student',
    )
    const response = await GET(request)
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe(
      'https://alrehla.app/dashboard/student',
    )
  })

  it('يرجع إلى / عند غياب قيمة next', async () => {
    const request = new Request(
      'https://alrehla.app/auth/callback?code=test-code',
    )
    const response = await GET(request)
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('https://alrehla.app/')
  })

  it('يرفض رابط HTTPS خارجي ويرجع إلى /', async () => {
    const request = new Request(
      'https://alrehla.app/auth/callback?code=test-code&next=https://evil.com',
    )
    const response = await GET(request)
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('https://alrehla.app/')
  })

  it('يرفض رابط //example.com ويرجع إلى /', async () => {
    const request = new Request(
      'https://alrehla.app/auth/callback?code=test-code&next=//evil.com',
    )
    const response = await GET(request)
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('https://alrehla.app/')
  })

  it('يعيد التوجيه إلى صفحة الخطأ عند فشل استبدال الكود', async () => {
    exchangeCodeForSession.mockResolvedValue({
      error: { message: 'invalid code' },
    })
    const request = new Request(
      'https://alrehla.app/auth/callback?code=bad-code&next=/account',
    )
    const response = await GET(request)
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe(
      'https://alrehla.app/auth/auth-code-error',
    )
  })
})
