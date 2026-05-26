export async function requestNotificationPermission() {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  const result = await Notification.requestPermission()
  return result === 'granted'
}

export function scheduleNotifications() {
  if (!('serviceWorker' in navigator) || Notification.permission !== 'granted') return

  // Use localStorage to track last notification times
  const now = new Date()
  const hour = now.getHours()

  const lastWeightNotif = localStorage.getItem('notif_weight')
  const today = now.toISOString().split('T')[0]

  // Morning weight reminder at 8am
  if (hour >= 8 && hour < 10 && lastWeightNotif !== today) {
    new Notification("Lian's Journey 🌸", {
      body: "Good morning! Don't forget to log your weight.",
      icon: '/icon-192.png',
      badge: '/icon-192.png',
    })
    localStorage.setItem('notif_weight', today)
  }

  // Evening habit reminder at 9pm
  const lastHabitNotif = localStorage.getItem('notif_habits')
  if (hour >= 21 && hour < 22 && lastHabitNotif !== today) {
    new Notification("Lian's Journey 🌸", {
      body: "Evening check-in — have you logged your habits today?",
      icon: '/icon-192.png',
    })
    localStorage.setItem('notif_habits', today)
  }
}

export function enableNotifications(onGranted) {
  requestNotificationPermission().then(granted => {
    if (granted) {
      scheduleNotifications()
      if (onGranted) onGranted()
    }
  })
}
