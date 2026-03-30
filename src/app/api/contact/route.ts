import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rateLimit";
import { sendEmail } from "@/lib/email";
import { withHandler } from "@/lib/handler";

const ContactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().email(),
  subject: z.string().trim().min(5).max(200),
  message: z.string().trim().min(20).max(2000),
});

export const POST = withHandler(async (req: Request) => {
  // Check if Resend API key is configured
  if (!process.env.RESEND_API_KEY) {
    console.warn(
      "RESEND_API_KEY not configured. Email notifications disabled.",
    );
    return NextResponse.json(
      { error: "Email service unavailable. Please try again later." },
      { status: 503 },
    );
  }

  // Rate limit: 5 contacts per hour per IP
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const rl = await rateLimit(`contact:${ip}`, 5, 60 * 60 * 1000);
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  const body = await req.json();
  const parsed = ContactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { name, email, subject, message } = parsed.data;

  // Send email to support
  try {
    await sendEmail({
      to: "support@gharam.in",
      subject: `Contact Form: ${subject}`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1B3B6F; margin-bottom: 20px;">New Contact Form Submission</h2>
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 8px 0;"><strong>From:</strong> ${name}</p>
            <p style="margin: 8px 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p style="margin: 8px 0;"><strong>Subject:</strong> ${subject}</p>
          </div>
          <div style="background: white; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h3 style="margin-top: 0; color: #374151;">Message:</h3>
            <p style="color: #6b7280; line-height: 1.6; white-space: pre-wrap;">${message}</p>
          </div>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #9ca3af; font-size: 12px;">Sent from PGLife contact form</p>
        </div>
      `,
    });

    // Send confirmation to user
    await sendEmail({
      to: email,
      subject: "We received your message - Gharam Support",
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1B3B6F;">Thank you for contacting Gharam</h2>
          <p>Hi ${name},</p>
          <p>We've received your message and will respond within 24-48 hours.</p>
          <div style="background: #f9fafb; padding: 20px; border-left: 4px solid #F59E0B; margin: 20px 0;">
            <p style="margin: 0; color: #6b7280;"><strong>Your message:</strong></p>
            <p style="margin-top: 10px; color: #6b7280; white-space: pre-wrap;">${message}</p>
          </div>
          <p>Best regards,<br><strong>Gharam Support Team</strong></p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #9ca3af; font-size: 12px;">
            If you have urgent questions, reply to this email or visit our <a href="https://gharam.in/help" style="color: #F59E0B;">Help Center</a>.
          </p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      {
        error:
          "Failed to send message. Please try again or email support@gharam.in directly.",
      },
      { status: 500 },
    );
  }
});
