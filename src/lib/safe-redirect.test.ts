import { describe, it, expect } from 'vitest'
import { getSafeRedirectPath } from './safe-redirect'

describe('getSafeRedirectPath', () => {
  it('يحافظ على المسارات الداخلية الصالحة', () => {
    expect(getSafeRedirectPath('/')).toBe('/')
    expect(getSafeRedirectPath('/account')).toBe('/account')
    expect(getSafeRedirectPath('/dashboard')).toBe('/dashboard')
    expect(getSafeRedirectPath('/dashboard/student')).toBe('/dashboard/student')
    expect(getSafeRedirectPath('/enha-lak')).toBe('/enha-lak')
    expect(getSafeRedirectPath('/bdayet-alrehla')).toBe('/bdayet-alrehla')
    expect(getSafeRedirectPath('/account?tab=orders')).toBe('/account?tab=orders')
    expect(getSafeRedirectPath('/profile#section')).toBe('/profile#section')
  })

  it('يرجع إلى / عند غياب قيمة next أو كونها فارغة', () => {
    expect(getSafeRedirectPath(undefined)).toBe('/')
    expect(getSafeRedirectPath(null)).toBe('/')
    expect(getSafeRedirectPath('')).toBe('/')
    expect(getSafeRedirectPath('   ')).toBe('/')
  })

  it('يرفض الروابط الخارجية الكاملة (HTTPS و HTTP)', () => {
    expect(getSafeRedirectPath('https://example.com')).toBe('/')
    expect(getSafeRedirectPath('https://example.com/dashboard')).toBe('/')
    expect(getSafeRedirectPath('http://example.com')).toBe('/')
    expect(getSafeRedirectPath('http://example.com/account')).toBe('/')
    expect(getSafeRedirectPath('https://evil.com')).toBe('/')
  })

  it('يرفض الروابط النسبية البروتوكولية (//example.com)', () => {
    expect(getSafeRedirectPath('//example.com')).toBe('/')
    expect(getSafeRedirectPath('//example.com/account')).toBe('/')
    expect(getSafeRedirectPath('///example.com')).toBe('/')
  })

  it('يرفض محاولات التجاوز بالشرطة المائلة العكسية والبروتوكولات الأخرى', () => {
    expect(getSafeRedirectPath('/\\example.com')).toBe('/')
    expect(getSafeRedirectPath('\\example.com')).toBe('/')
    expect(getSafeRedirectPath('javascript:alert(1)')).toBe('/')
    expect(getSafeRedirectPath('data:text/html,test')).toBe('/')
  })
})
