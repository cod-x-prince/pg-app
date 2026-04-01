import { prisma } from "@/lib/prisma"

export type NotificationType =
  | "BOOKING_NEW"
  | "BOOKING_CONFIRMED"
  | "BOOKING_CANCELLED"
  | "PROPERTY_APPROVED"
  | "PROPERTY_REJECTED"
  | "REVIEW_NEW"
  | "KYC_APPROVED"
  | "KYC_REJECTED"

interface CreateNotificationParams {
  userId: string
  type: NotificationType
  title: string
  message: string
  link?: string
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    return await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        link: params.link ?? null,
      },
    })
  } catch (error) {
    console.error("[Notification] Failed to create:", error)
    // Don't throw - notifications are non-critical
    return null
  }
}

export async function getUserNotifications(userId: string, limit = 20) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  })
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({
    where: { userId, isRead: false },
  })
}

export async function markAsRead(notificationId: string, userId: string) {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { isRead: true },
  })
}

export async function markAllAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  })
}

export async function deleteNotification(notificationId: string, userId: string) {
  return prisma.notification.deleteMany({
    where: { id: notificationId, userId },
  })
}
