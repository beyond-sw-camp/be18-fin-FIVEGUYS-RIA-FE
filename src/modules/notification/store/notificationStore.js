import { defineStore } from 'pinia'
import axios from 'axios'
import { EventSource } from 'event-source-polyfill'

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [],
    filterType: null,
    connectionState: 'disconnected',
    retryCount: 0,
    allowRetry: true,
    lastEventId: localStorage.getItem('lastEventId') || null,
    eventSource: null,
    reconnectTimer: null,
    toastList: [],
    toastQueue: []
  }),

  getters: {
    filteredNotifications: (state) =>
      state.filterType
        ? state.notifications.filter(n => n.type === state.filterType)
        : state.notifications
  },

  actions: {
    /** ------------------------------------------------------
     *  SSE 연결 (로그인 직후 1번만 연결)
     * ------------------------------------------------------ */
    connectSSE() {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        console.log('[SSE] 토큰 없음 → 연결 안함')
        return
      }

      if (this.eventSource && this.eventSource.readyState !== EventSource.CLOSED) {
        console.log('[SSE] 이미 연결됨 또는 연결 중 → 스킵')
        return
      }

      console.log('[SSE] Connecting...')
      this.connectionState = 'connecting'

      const baseUrl = `${import.meta.env.VITE_API_BASE_URL}/api/sse/notifications`
      console.log('[SSE] baseUrl =', baseUrl)

      const params = new URLSearchParams()
      params.append('token', token)

      if (this.lastEventId) {
        params.append('lastEventId', this.lastEventId)
      }

      const url = `${baseUrl}?${params.toString()}`
      console.log('[SSE] full url =', url)

      this.eventSource = new EventSource(url)

      // =========================
      // 연결 성공
      // =========================
      this.eventSource.onopen = () => {
        console.log('[SSE] Connected')

        if (this.connectionState !== 'connected') {
          this.connectionState = 'connected'
          this.retryCount = 0
          this.allowRetry = true
        }
      }

      // =========================
      // 알림 수신
      // =========================
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

          const newNotification = {
            id: notifId,
            senderId: mappedNotif.senderId,
            receiverId: mappedNotif.receiverId,
            targetType: mappedNotif.targetType,
            targetAction: mappedNotif.targetAction,
            targetId: mappedNotif.targetId,
            message: mappedNotif.message,
            read: mappedNotif.isRead ?? false,
            createdAt: mappedNotif.createdAt
          }

          const index = this.notifications.findIndex(n => n.id === notifId)

          if (index !== -1) {
            this.notifications.splice(index, 1, newNotification)
          } else {
            this.notifications.unshift(newNotification)
            if (!newNotification.read) {
                this.pushToast(newNotification)
            }
            console.log('[SSE] pushToast called')
          }

          if (this.notifications.length > 100) {
            this.notifications.splice(-1, 1)
          }

        } catch (e) {
          console.error('[SSE] JSON parse error:', e)
        }
      })

      // =========================
      // 에러 / 끊김
      // =========================
      this.eventSource.onerror = (err) => {
        console.error('[SSE] Error:', err)

        if (this.eventSource.readyState === EventSource.CLOSED) {
          console.log('[SSE] Connection closed')
          this.connectionState = 'error'
          this.handleReconnect()
        }
      }
    },

    /** ------------------------------------------------------
     *  명시적 disconnect (로그아웃 / 탭 종료)
     * ------------------------------------------------------ */
    disconnectSSE() {
      console.log('[SSE] Disconnect requested')

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

      this.notifications = []
      this.lastEventId = null
      localStorage.removeItem('lastEventId')
    },

    /** ------------------------------------------------------
     *  서버가 완전히 죽었을 때만 자동 재연결
     * ------------------------------------------------------ */
    handleReconnect() {
      if (!this.allowRetry) {
        console.log('[SSE] allowRetry=false → 재연결 안함')
        return
      }

      this.retryCount++
      const delay = Math.min(1000 * Math.pow(2, this.retryCount), 30000)

      console.warn(`[SSE] Retry #${this.retryCount} in ${delay / 1000}s`)

      this.reconnectTimer = setTimeout(() => {
        this.connectSSE()
      }, delay)
    },

    /** ------------------------------------------------------
     *  초기 fetch (기존 알림 로드)
     * ------------------------------------------------------ */
    async fetchNotifications() {
      try {
        const token = localStorage.getItem('accessToken')
        if (!token) return

        const baseUrl = import.meta.env.VITE_API_BASE_URL
        const res = await axios.get(`${baseUrl}/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        let list = []
        if (Array.isArray(res.data)) list = res.data
        else if (Array.isArray(res.data.data)) list = res.data.data

        list.forEach(n => {
          const id = n.notificationId ?? n.id

          if (!this.notifications.some(nn => nn.id === id)) {
            this.notifications.push({
              id,
              senderId: n.senderId,
              receiverId: n.receiverId,
              targetType: n.targetType,
              targetAction: n.targetAction,
              targetId: n.targetId,
              message: n.message,
              read: n.read ?? false,
              createdAt: n.createdAt
            })
          }
        })

        if (this.notifications.length)
          this.lastEventId = this.notifications[0].id

      } catch (err) {
        console.error('fetchNotifications error', err)
      }
    },

    /** ------------------------------------------------------
     *  알림 수신 시
     * ------------------------------------------------------ */
    pushToast(notification) {
      console.log('pushToast called:', notification)
      const toast = { id: Date.now(), notification }

      const MAX_TOAST = 3

      if (this.toastList.length >= MAX_TOAST) {
        this.toastQueue.push(toast)
      } else {
        this.toastList.push(toast)
        this.autoRemoveToast(toast)
      }
    },
    autoRemoveToast(toast) {
      setTimeout(() => {

        this.toastList = this.toastList.filter(t => t.id !== toast.id)
        
        if (this.toastQueue.length > 0) {
          const next = this.toastQueue.shift()
          this.toastList.push(next)
          this.autoRemoveToast(next)
        }
      }, 8000)
    },

    /** ------------------------------------------------------
     *  알림 클릭 시 이동
     * ------------------------------------------------------ */
    async handleNotificationClick(notification, router) {
      // 1. 읽음 처리
      if (!notification.read) {
        notification.read = true
        try {
          const baseUrl = import.meta.env.VITE_API_BASE_URL
          await axios.patch(`${baseUrl}/api/notifications/${notification.id}`, {}, {
            headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
          })
          this.markAsRead(notification.id)
        } catch (err) {
          console.error(err)
        }
      }

      // 2. 라우팅
      switch (notification.targetType) {
        case 'PROPOSAL':
          router.push(`/proposal/${notification.targetId}`)
          break
        case 'PROJECT':
          router.push(`/project/${notification.targetId}`)
          break
        case 'ESTIMATE':
          router.push(`/estimate/${notification.targetId}`)
          break
        case 'CONTRACT':
          router.push(`/contract/${notification.targetId}`)
          break
        case 'REVENUE':
          router.push(`/revenue/${notification.targetId}`)
          break
        default:
          console.warn('Unknown notification targetType:', notification.targetType)
      }
    },

    /** ------------------------------------------------------
     *  알림 읽음 처리
     * ------------------------------------------------------ */
    markAsRead(notificationId) {
      const index = this.notifications.findIndex(n => n.id === notificationId)
      if (index !== -1) {
        this.notifications[index] = {
          ...this.notifications[index],
          read: true
        }
      }
    }

  }
})