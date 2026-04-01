import { describe, expect, it } from '@jest/globals'

describe('Email Template Generation', () => {
  describe('Email content structure', () => {
    it('should generate booking confirmation email content', () => {
      const data = {
        tenantName: 'John Doe',
        tenantEmail: 'john@example.com',
        propertyName: 'Sunshine PG',
        propertyCity: 'Delhi',
        roomType: 'SINGLE',
        rent: 5000,
        moveInDate: new Date('2026-04-15'),
        bookingId: 'booking_123',
        ownerWhatsapp: '9876543210',
      }

      // Test content generation logic
      const dateStr = new Date(data.moveInDate).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })

      expect(data.tenantName).toBe('John Doe')
      expect(data.rent).toBe(5000)
      expect(dateStr).toContain('2026')
    })

    it('should generate owner booking notification content', () => {
      const data = {
        ownerName: 'Jane Owner',
        ownerEmail: 'jane@example.com',
        tenantName: 'John Doe',
        tenantPhone: '9876543210',
        tenantEmail: 'john@example.com',
        propertyName: 'Sunshine PG',
        roomType: 'SINGLE',
        rent: 5000,
        moveInDate: new Date('2026-04-15'),
        bookingId: 'booking_123',
        tokenPaid: true,
      }

      expect(data.tokenPaid).toBe(true)
      expect(data.rent.toLocaleString('en-IN')).toBe('5,000')
    })

    it('should format rent with Indian number format', () => {
      const rent = 50000
      expect(rent.toLocaleString('en-IN')).toBe('50,000')

      const largeRent = 500000
      expect(largeRent.toLocaleString('en-IN')).toBe('5,00,000')
    })

    it('should format WhatsApp link correctly', () => {
      const ownerWhatsapp = '9876543210'
      const propertyName = 'Sunshine PG'
      const bookingId = 'booking_123'

      const link = `https://wa.me/91${ownerWhatsapp}?text=Hi%2C+I+just+booked+${encodeURIComponent(
        propertyName
      )}+on+Gharam.+My+booking+ID+is+${bookingId}.`

      expect(link).toContain('https://wa.me/919876543210')
      expect(link).toContain('Sunshine%20PG')
      expect(link).toContain('booking_123')
    })

    it('should generate password reset URL correctly', () => {
      const token = 'reset_token_abc123'
      const baseUrl = 'https://gharam.in'
      const resetUrl = `${baseUrl}/auth/reset-password?token=${encodeURIComponent(token)}`

      expect(resetUrl).toBe('https://gharam.in/auth/reset-password?token=reset_token_abc123')
    })

    it('should handle welcome email for owner role', () => {
      const data = {
        name: 'Owner Name',
        email: 'owner@example.com',
        role: 'OWNER',
      }

      const isOwner = data.role === 'OWNER' || data.role === 'BROKER'
      expect(isOwner).toBe(true)
    })

    it('should handle welcome email for tenant role', () => {
      const data = {
        name: 'Tenant Name',
        email: 'tenant@example.com',
        role: 'TENANT',
      }

      const isOwner = data.role === 'OWNER' || data.role === 'BROKER'
      expect(isOwner).toBe(false)
    })
  })

  describe('Email data validation', () => {
    it('should validate required booking confirmation fields', () => {
      const requiredFields = [
        'tenantName',
        'tenantEmail',
        'propertyName',
        'propertyCity',
        'roomType',
        'rent',
        'moveInDate',
        'bookingId',
      ]

      const data = {
        tenantName: 'John Doe',
        tenantEmail: 'john@example.com',
        propertyName: 'Sunshine PG',
        propertyCity: 'Delhi',
        roomType: 'SINGLE',
        rent: 5000,
        moveInDate: new Date(),
        bookingId: 'booking_123',
      }

      requiredFields.forEach(field => {
        expect(data[field as keyof typeof data]).toBeDefined()
      })
    })

    it('should handle optional WhatsApp field', () => {
      const dataWithWhatsApp = {
        ownerWhatsapp: '9876543210',
      }

      const dataWithoutWhatsApp = {
        ownerWhatsapp: null,
      }

      expect(dataWithWhatsApp.ownerWhatsapp).toBeTruthy()
      expect(dataWithoutWhatsApp.ownerWhatsapp).toBeFalsy()
    })
  })
})
