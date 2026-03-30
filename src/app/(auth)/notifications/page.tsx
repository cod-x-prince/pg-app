"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import type { SessionUser } from "@/types"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  isRead: boolean
  createdAt: string
}

export default function NotificationsPage() {
  const { data: session } = useSession()
  const user = session?.user as SessionUser | undefined
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "unread">("all")

  useEffect(() => {
    if (!user) return
    loadNotifications()
  }, [user])

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/notifications")
      const data = await res.json()
      setNotifications(data || [])
    } catch (error) {
      console.error("Failed to load notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: "PUT" })
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n))
    } catch (error) {
      console.error("Failed to mark as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications", { method: "PUT" })
      setNotifications(notifications.map(n => ({ ...n, isRead: true })))
    } catch (error) {
      console.error("Failed to mark all as read:", error)
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: "DELETE" })
      setNotifications(notifications.filter(n => n.id !== id))
    } catch (error) {
      console.error("Failed to delete notification:", error)
    }
  }

  const filteredNotifications = filter === "unread" 
    ? notifications.filter(n => !n.isRead) 
    : notifications

  const unreadCount = notifications.filter(n => !n.isRead).length

  if (!user) {
    return (
      <div className="section-wrap py-12">
        <div className="text-center">
          <p className="text-muted-foreground">Please log in to view notifications</p>
          <Link href="/auth/login" className="btn-primary mt-4 inline-block">
            Log in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="section-wrap py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display font-bold text-2xl text-foreground">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                {unreadCount} unread {unreadCount === 1 ? "notification" : "notifications"}
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-primary hover:underline font-medium"
            >
              Mark all as read
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-primary text-white"
                : "bg-muted text-foreground hover:bg-muted/80"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "unread"
                ? "bg-primary text-white"
                : "bg-muted text-foreground hover:bg-muted/80"
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-xl border border-border p-12 text-center">
            <svg className="w-16 h-16 text-muted-foreground mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
            <h3 className="font-display font-semibold text-lg text-foreground mb-2">
              {filter === "unread" ? "No unread notifications" : "No notifications yet"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {filter === "unread" 
                ? "You're all caught up!" 
                : "We'll notify you when something happens"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-xl border border-border p-4 hover:shadow-md transition-all ${
                  !notification.isRead ? "bg-primary/5 border-primary/20" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-2.5 h-2.5 rounded-full mt-2 shrink-0 ${
                    !notification.isRead ? "bg-primary" : "bg-transparent"
                  }`} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-1">
                      <h3 className="font-medium text-base text-foreground">
                        {notification.title}
                      </h3>
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="text-muted-foreground hover:text-foreground transition-colors p-1"
                        aria-label="Delete notification"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      </button>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center gap-4">
                      <p className="text-xs text-muted-foreground">
                        {new Date(notification.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      
                      {notification.link && (
                        <Link
                          href={notification.link}
                          onClick={() => !notification.isRead && markAsRead(notification.id)}
                          className="text-xs text-primary hover:underline font-medium"
                        >
                          View →
                        </Link>
                      )}
                      
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs text-primary hover:underline font-medium"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
