// tests/utils/sendEmail.test.js
import { sendEmail } from '../../utils/sendEmail'
import nodemailer from 'nodemailer'

jest.mock('nodemailer')

describe('sendEmail', () => {
  let mockSendMail

  beforeEach(() => {
    mockSendMail = jest.fn()
    nodemailer.createTransport.mockReturnValue({
      sendMail: mockSendMail,
    })
  })

  afterEach(() => jest.clearAllMocks())

  it('creates transporter with gmail service and correct auth credentials', async () => {
    mockSendMail.mockResolvedValue({ response: '250 OK' })

    await sendEmail('to@test.com', 'Subject', '<p>body</p>')

    expect(nodemailer.createTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        service: 'gmail',
        auth: expect.objectContaining({
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        }),
      })
    )
  })

  it('calls sendMail with correct to, subject, and html', async () => {
    mockSendMail.mockResolvedValue({ response: '250 OK' })

    await sendEmail('recipient@test.com', 'Test Subject', '<h1>Hello</h1>')

    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to:      'recipient@test.com',
        subject: 'Test Subject',
        html:    '<h1>Hello</h1>',
      })
    )
  })

  it('sets from field using EMAIL_USER env variable', async () => {
    mockSendMail.mockResolvedValue({ response: '250 OK' })

    await sendEmail('to@test.com', 'Sub', '<p>body</p>')

    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: expect.stringContaining(process.env.EMAIL_USER),
      })
    )
  })

  it('returns the info object from sendMail on success', async () => {
    const mockInfo = { response: '250 Message queued', messageId: 'abc123' }
    mockSendMail.mockResolvedValue(mockInfo)

    const result = await sendEmail('to@test.com', 'Sub', '<p>body</p>')

    expect(result).toEqual(mockInfo)
  })

  it('throws "Email could not be sent" error when sendMail fails', async () => {
    mockSendMail.mockRejectedValue(new Error('SMTP connection failed'))

    await expect(
      sendEmail('to@test.com', 'Sub', '<p>body</p>')
    ).rejects.toThrow('Email could not be sent')
  })

})