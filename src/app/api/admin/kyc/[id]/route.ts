import { withHandler } from "@/lib/handler";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import type { SessionUser } from "@/types";

export const dynamic = "force-dynamic";

export const PUT = withHandler(
  async (req: Request, { params }: { params: { id: string } }) => {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser | undefined;

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status, reason } = await req.json();

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const document = await prisma.kYCDocument.update({
      where: { id: params.id },
      data: { status, reason, reviewedAt: new Date(), reviewedBy: user.id },
      include: { user: true },
    });

    const allDocs = await prisma.kYCDocument.findMany({
      where: { userId: document.userId },
    });
    const allApproved =
      allDocs.length >= 3 && allDocs.every((d: any) => d.status === "APPROVED");

    if (allApproved && !document.user.isApproved) {
      await prisma.user.update({
        where: { id: document.userId },
        data: { isApproved: true },
      });
    }

    if (status === "APPROVED") {
      if (allApproved) {
        await sendEmail({
          to: document.user.email,
          subject: "KYC Verified - Start Listing Properties!",
          html: `<h2>Congratulations! Your KYC is Verified</h2><p>Hi ${document.user.name},</p><p>All your KYC documents have been verified successfully.</p><p><a href="${process.env.NEXTAUTH_URL}/owner/listings/new">List Your First Property</a></p>`,
        });
      }
    } else if (status === "REJECTED") {
      await sendEmail({
        to: document.user.email,
        subject: "KYC Document Rejected",
        html: `<h2>Document Rejected</h2><p>Hi ${document.user.name},</p><p>Your ${document.type.replace(/_/g, " ")} could not be verified.</p>${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}<p><a href="${process.env.NEXTAUTH_URL}/profile">Upload New Document</a></p>`,
      });
    }

    return NextResponse.json({ success: true });
  },
);
