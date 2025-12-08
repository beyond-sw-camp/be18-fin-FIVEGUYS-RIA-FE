import { defineStore } from 'pinia'
import axios from 'axios'
import { EventSourcePolyfill } from 'event-source-polyfill'

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [],
    filterType: null,
    connectionState: 'disconnected', 
    retryCount: 0,
    allowRetry: true,
    lastEventId: localStorage.getItem('lastEventId') || null,
    eventSource: null,
    reconnectTimer: null
  }),

  getters: {
    filteredNotifications: (state) =>
      state.filterType
        ? state.notifications.filter(n => n.type === state.filterType)
        : state.notifications
  },

  actions: {
    connectSSE() {
      const token = localStorage.getItem('accessToken')
      if (!token) return

      if (this.eventSource) {
        this.eventSource.close()
        this.eventSource = null
      }

      this.connectionState = 'connecting'
      console.log('[SSE] Connecting with token:', token)

      const baseUrl = 'http://localhost:8080/api/sse/notifications'
      const query = this.lastEventId 
        ? `?lastEventId=${encodeURIComponent(this.lastEventId)}`
        : ''
      const url = baseUrl + query

      console.log('[SSE] subscribe URL:', url)

      this.eventSource = new EventSourcePolyfill(url, {
        headers: { Authorization: `Bearer ${token}` },
        heartbeatTimeout: 45000
      })

      this.eventSource.onopen = () => {
        console.log('[SSE] Connected!')
        this.connectionState = 'connected'
        this.retryCount = 0
      }

      this.eventSource.addEventListener('notification', (event) => {
        if (!event.data) return

        try {
          const mappedNotif = JSON.parse(event.data)
          console.log('[SSE] Received:', mappedNotif)

          if (event.lastEventId) {
            this.lastEventId = event.lastEventId
            localStorage.setItem('lastEventId', this.lastEventId)
          }

          const notifId = mappedNotif.notificationId ?? mappedNotif.id

          // 중복 방지
          if (!this.notifications.some(n => n.id === notifId)) {
            this.notifications.unshift({
              id: notifId,
              senderId: mappedNotif.senderId,
              receiverId: mappedNotif.receiverId,
              targetType: mappedNotif.targetType,
              targetAction: mappedNotif.targetAction,
              targetId: mappedNotif.targetId,
              message: mappedNotif.message,
              read: mappedNotif.isRead ?? false,
              createdAt: mappedNotif.createdAt
            })

            // 100개 초과 방지
            if (this.notifications.length > 100) this.notifications.splice(-1, 1)
          }
        } catch (e) {
          console.error('[SSE] parse error', e)
        }
      })

      this.eventSource.addEventListener('connect', (event) => {
        console.log('[SSE] connect event:', event.data)
      })

      this.eventSource.onerror = (err) => {
        console.error('[SSE] Error:', err)
        this.connectionState = 'error'
        this.handleReconnect()
      }
    },

    disconnectSSE() {
      console.log('[SSE] disconnect requested')
      this.allowRetry = false
      this.retryCount = 0

      if (this.eventSource) {
        this.eventSource.close()
        this.eventSource = null
      }

      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer)
        this.reconnectTimer = null
      }

      this.connectionState = 'disconnected'
    },

    handleReconnect() {
      if (!this.allowRetry) return

      this.retryCount++
      const delay = Math.min(1000 * Math.pow(2, this.retryCount), 30000)

      console.warn(`[SSE] Retry #${this.retryCount} in ${delay / 1000}s`)

      this.reconnectTimer = setTimeout(() => {
        this.connectSSE()
      }, delay)
    },

    async fetchNotifications() {
      try {
        const token = localStorage.getItem('accessToken')
        if (!token) throw new Error('No accessToken found')

        const res = await axios.get('/api/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        })
        console.log('fetchNotifications 응답:', res)

        let notificationsArray = []
        if (Array.isArray(res.data)) notificationsArray = res.data
        else if (Array.isArray(res.data.data)) notificationsArray = res.data.data
        else {
          console.warn('fetchNotifications: unexpected structure', res.data)
          return
        }

        notificationsArray.forEach(n => {
          const id = n.notificationId ?? n.id
          if (!this.notifications.some(notif => notif.id === id)) {
            this.notifications.push({
              id,
              senderId: n.senderId,
              receiverId: n.receiverId,
              targetType: n.targetType,
              targetAction: n.targetAction,
              targetId: n.targetId,
              message: n.message,
              read: n.isRead ?? false,
              createdAt: n.createdAt
            })
          }
        })

        if (this.notifications.length)
          this.lastEventId = this.notifications[0].id

        console.log('fetchNotifications 완료:', this.notifications)
      } catch (err) {
        console.error('fetchNotifications error', err)
      }
    }
  }
})
