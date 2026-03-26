import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM   = process.env.RESEND_FROM_EMAIL ?? "Gharam <noreply@gharam.in>"
const BASE   = process.env.NEXTAUTH_URL ?? "https://gharam.in"

// ── Templates ─────────────────────────────────────────────────────────────

function baseTemplate(content: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gharam</title>
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:\'DM Sans\',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <!-- Header -->
        <tr>
          <td style="background:#0F2347;padding:32px 40px;border-radius:16px 16px 0 0;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="background:#FF7A3D;width:40px;height:40px;border-radius:10px;text-align:center;vertical-align:middle;">
                        <span style="color:white;font-weight:700;font-size:16px;">G</span>
                      </td>
                      <td style="padding-left:12px;">
                        <span style="color:white;font-size:22px;font-weight:600;">Gharam</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="background:white;padding:40px;border-radius:0 0 16px 16px;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
            ${content}
            <!-- Footer -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:40px;padding-top:24px;border-top:1px solid #f3f4f6;">
              <tr>
                <td style="color:#9ca3af;font-size:12px;text-align:center;line-height:1.6;">
                  <p style="margin:0 0 8px;">Gharam · Stay where it feels right</p>
                  <p style="margin:0;">
                    <a href="${BASE}/privacy" style="color:#9ca3af;">Privacy Policy</a> &nbsp;·&nbsp;
                    <a href="${BASE}/terms" style="color:#9ca3af;">Terms of Service</a> &nbsp;·&nbsp;
                    <a href="mailto:support@gharam.in" style="color:#9ca3af;">Support</a>
                  </p>
                  <p style="margin:12px 0 0;">
                    <a href="${BASE}/profile" style="color:#9ca3af;font-size:11px;">Unsubscribe or manage email preferences</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ── Email: Booking confirmed (to tenant) ──────────────────────────────────

export async function sendBookingConfirmedTenant(data: {
  tenantName:   string
  tenantEmail:  string
  propertyName: string
  propertyCity: string
  roomType:     string
  rent:         number
  moveInDate:   Date
  bookingId:    string
  ownerWhatsapp?: string | null
}) {
  const dateStr = new Date(data.moveInDate).toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  })

  const content = `
    <h1 style="color:#0F2347;font-size:24px;margin:0 0 8px;font-family:Georgia,serif;">
      Booking Confirmed! 🎉
    </h1>
    <p style="color:#6b7280;font-size:15px;margin:0 0 32px;">
      Hi ${data.tenantName}, your token has been received on Gharam. Here are your booking details.
    </p>

    <!-- Booking card -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:12px;padding:24px;margin-bottom:32px;">
      <tr><td>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding-bottom:16px;border-bottom:1px solid #e5e7eb;">
              <p style="margin:0;font-size:18px;font-weight:600;color:#111827;font-family:Georgia,serif;">${data.propertyName}</p>
              <p style="margin:4px 0 0;font-size:14px;color:#9ca3af;">${data.propertyCity}</p>
            </td>
          </tr>
          <tr><td style="padding-top:16px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-bottom:10px;">
                  <span style="color:#9ca3af;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Room Type</span><br>
                  <span style="color:#111827;font-size:15px;font-weight:500;">${data.roomType}</span>
                </td>
                <td style="padding-bottom:10px;">
                  <span style="color:#9ca3af;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Monthly Rent</span><br>
                  <span style="color:#111827;font-size:15px;font-weight:500;">₹${data.rent.toLocaleString("en-IN")}</span>
                </td>
              </tr>
              <tr>
                <td>
                  <span style="color:#9ca3af;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Move-in Date</span><br>
                  <span style="color:#111827;font-size:15px;font-weight:500;">${dateStr}</span>
                </td>
                <td>
                  <span style="color:#9ca3af;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Token Paid</span><br>
                  <span style="color:#059669;font-size:15px;font-weight:600;">₹500 ✓</span>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      </td></tr>
    </table>

    ${data.ownerWhatsapp ? `
    <!-- WhatsApp CTA -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr><td>
        <p style="color:#374151;font-size:14px;margin:0 0 16px;">
          The owner has been notified via Gharam. You can contact them directly on WhatsApp:
        </p>
        <a href="https://wa.me/91${data.ownerWhatsapp}?text=Hi%2C+I+just+booked+${encodeURIComponent(data.propertyName)}+on+Gharam.+My+booking+ID+is+${data.bookingId}."
          style="display:inline-block;background:#25D366;color:white;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:600;font-size:14px;">
          WhatsApp Owner →
        </a>
      </td></tr>
    </table>
    ` : ""}

    <a href="${BASE}/dashboard"
      style="display:inline-block;background:#1B3B6F;color:white;text-decoration:none;padding:14px 28px;border-radius:12px;font-weight:600;font-size:14px;">
      View My Bookings →
    </a>
  `

  return resend.emails.send({
    from:    FROM,
    to:      data.tenantEmail,
    subject: `Booking Confirmed — ${data.propertyName} | Gharam`,
    html:    baseTemplate(content),
  })
}

// ── Email: New booking alert (to owner) ───────────────────────────────────

export async function sendNewBookingOwner(data: {
  ownerName:    string
  ownerEmail:   string
  tenantName:   string
  tenantPhone:  string
  tenantEmail:  string
  propertyName: string
  roomType:     string
  rent:         number
  moveInDate:   Date
  bookingId:    string
  tokenPaid:    boolean
}) {
  const dateStr = new Date(data.moveInDate).toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  })

  const content = `
    <h1 style="color:#0F2347;font-size:24px;margin:0 0 8px;font-family:Georgia,serif;">
      New Booking ${data.tokenPaid ? "✓ Token Paid" : "Request"}!
    </h1>
    <p style="color:#6b7280;font-size:15px;margin:0 0 32px;">
      Hi ${data.ownerName}, you have a new ${data.tokenPaid ? "confirmed token booking" : "booking enquiry"} for ${data.propertyName} on Gharam.
    </p>

    <!-- Tenant details -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:12px;padding:24px;margin-bottom:32px;">
      <tr><td>
        <p style="margin:0 0 16px;font-size:13px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;">Tenant Details</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding-bottom:12px;">
              <span style="color:#9ca3af;font-size:12px;">Name</span><br>
              <span style="color:#111827;font-size:15px;font-weight:500;">${data.tenantName}</span>
            </td>
            <td style="padding-bottom:12px;">
              <span style="color:#9ca3af;font-size:12px;">Phone</span><br>
              <span style="color:#111827;font-size:15px;font-weight:500;">${data.tenantPhone || "Not provided"}</span>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:12px;">
              <span style="color:#9ca3af;font-size:12px;">Room</span><br>
              <span style="color:#111827;font-size:15px;font-weight:500;">${data.roomType} — ₹${data.rent.toLocaleString("en-IN")}/mo</span>
            </td>
            <td>
              <span style="color:#9ca3af;font-size:12px;">Move-in Date</span><br>
              <span style="color:#111827;font-size:15px;font-weight:500;">${dateStr}</span>
            </td>
          </tr>
        </table>
        ${data.tokenPaid ? `
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;padding-top:16px;border-top:1px solid #e5e7eb;">
          <tr><td style="background:#ecfdf5;border-radius:8px;padding:12px;">
            <span style="color:#059669;font-weight:600;font-size:14px;">✓ Token of ₹500 received — Room is held for this tenant</span>
          </td></tr>
        </table>
        ` : ""}
      </td></tr>
    </table>

    <a href="${BASE}/owner/dashboard"
      style="display:inline-block;background:#1B3B6F;color:white;text-decoration:none;padding:14px 28px;border-radius:12px;font-weight:600;font-size:14px;">
      View in Dashboard →
    </a>
  `

  return resend.emails.send({
    from:    FROM,
    to:      data.ownerEmail,
    subject: `New Booking — ${data.propertyName} (${data.tokenPaid ? "Token Paid" : "Enquiry"}) | Gharam`,
    html:    baseTemplate(content),
  })
}

// ── Email: Signup welcome ─────────────────────────────────────────────────

export async function sendWelcomeEmail(data: {
  name:  string
  email: string
  role:  string
}) {
  const isOwner = data.role === "OWNER" || data.role === "BROKER"

  const content = `
    <h1 style="color:#0F2347;font-size:24px;margin:0 0 8px;font-family:Georgia,serif;">
      Welcome to Gharam! 🏠
    </h1>
    <p style="color:#6b7280;font-size:15px;margin:0 0 24px;">
      Hi ${data.name}, thanks for joining Gharam — stay where it feels right.
    </p>

    ${isOwner ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef3c7;border-radius:12px;padding:20px;margin-bottom:24px;">
      <tr><td>
        <p style="margin:0;color:#92400e;font-size:14px;font-weight:600;">⏳ Account Pending Approval</p>
        <p style="margin:8px 0 0;color:#78350f;font-size:13px;">
          Your owner account is being reviewed by our team. You\'ll receive an email once approved, 
          usually within 24 hours.
        </p>
      </td></tr>
    </table>
    ` : `
    <p style="color:#374151;font-size:14px;margin:0 0 24px;">
      You can now browse verified PGs across India. Start exploring!
    </p>
    <a href="${BASE}/properties/bangalore"
      style="display:inline-block;background:#1B3B6F;color:white;text-decoration:none;padding:14px 28px;border-radius:12px;font-weight:600;font-size:14px;">
      Browse PGs →
    </a>
    `}
  `

  return resend.emails.send({
    from:    FROM,
    to:      data.email,
    subject: "Welcome to Gharam 🏠",
    html:    baseTemplate(content),
  })
}

// ── Email: Owner approved ─────────────────────────────────────────────────

export async function sendOwnerApprovedEmail(data: {
  name:  string
  email: string
}) {
  const content = `
    <h1 style="color:#0F2347;font-size:24px;margin:0 0 8px;font-family:Georgia,serif;">
      Your account is approved! ✓
    </h1>
    <p style="color:#6b7280;font-size:15px;margin:0 0 24px;">
      Hi ${data.name}, great news — your Gharam owner account has been approved.
      You can now list your PG and start receiving booking requests.
    </p>
    <a href="${BASE}/owner/listings/new"
      style="display:inline-block;background:#F59E0B;color:#1B3B6F;text-decoration:none;padding:14px 28px;border-radius:12px;font-weight:700;font-size:14px;">
      List Your PG Now →
    </a>
  `

  return resend.emails.send({
    from:    FROM,
    to:      data.email,
    subject: "Your Gharam owner account is approved ✓",
    html:    baseTemplate(content),
  })
}

// ── Email: Password Reset ─────────────────────────────────────────────────

export async function sendPasswordResetEmail(data: {
  name:  string
  email: string
  token: string
}) {
  const resetUrl = `${BASE}/auth/reset-password?token=${encodeURIComponent(data.token)}`

  const content = `
    <h1 style="color:#0F2347;font-size:24px;margin:0 0 8px;font-family:Georgia,serif;">
      Reset Your Password
    </h1>
    <p style="color:#6b7280;font-size:15px;margin:0 0 24px;">
      Hi ${data.name}, we received a request to reset your password for your Gharam account.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef3c7;border-radius:12px;padding:20px;margin-bottom:24px;">
      <tr><td>
        <p style="margin:0;color:#92400e;font-size:14px;font-weight:600;">🔒 Security Notice</p>
        <p style="margin:8px 0 0;color:#78350f;font-size:13px;">
          This link will expire in <strong>1 hour</strong> for security.
          If you didn't request this, please ignore this email.
        </p>
      </td></tr>
    </table>

    <a href="${resetUrl}"
      style="display:inline-block;background:#1B3B6F;color:white;text-decoration:none;padding:14px 28px;border-radius:12px;font-weight:600;font-size:14px;margin-bottom:24px;">
      Reset Password →
    </a>

    <p style="color:#9ca3af;font-size:12px;margin:24px 0 0;line-height:1.6;">
      Or copy and paste this link into your browser:<br>
      <span style="color:#6b7280;word-break:break-all;">${resetUrl}</span>
    </p>
  `

  return resend.emails.send({
    from:    FROM,
    to:      data.email,
    subject: "Reset Your Gharam Password",
    html:    baseTemplate(content),
  })
}
