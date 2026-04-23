import axios from 'axios'

// API base URL - can be configured via environment variable
const API_BASE_URL =
  import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000' : 'https://solidv2-5ah5.onrender.com')

// Create axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
})

const normalizeError = (error, fallback) => {
  const message = error?.response?.data?.message
  if (message) {
    return new Error(message)
  }
  return error instanceof Error ? error : new Error(fallback)
}

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth-token')
      localStorage.removeItem('grannys-shop-user')
    }
    throw error
  }
)

// Auth endpoints
export async function login(name, pin) {
  const response = await api.post('/auth/login', { name, pin })
  const { user, token } = response.data
  localStorage.setItem('auth-token', token)
  return user
}

export async function logout(staffName) {
  try {
    await api.post('/auth/logout', { staffName })
  } finally {
    localStorage.removeItem('auth-token')
  }
  return true
}

// Sales endpoints
export async function getSales(filters = {}) {
  try {
    const response = await api.get('/sales', { params: filters })
    return response.data
  } catch (error) {
    throw normalizeError(error, 'Unable to load sales')
  }
}

export async function recordSale(staffId, staffName, customerName, drinkId, quantity) {
  try {
    const response = await api.post('/sales', {
      staffId,
      staffName,
      customerName,
      drinkId,
      quantity,
    })
    return response.data
  } catch (error) {
    throw normalizeError(error, 'Unable to record sale')
  }
}

// Stock endpoints
export async function getStock(filters = {}) {
  try {
    const response = await api.get('/stock', { params: filters })
    return response.data
  } catch (error) {
    throw normalizeError(error, 'Unable to load stock')
  }
}

export async function updateStock(drinkId, newQuantity, staffName) {
  try {
    const response = await api.patch(`/stock/${drinkId}/quantity`, {
      newQuantity,
      staffName,
    })
    return response.data
  } catch (error) {
    throw normalizeError(error, 'Unable to update stock')
  }
}

export async function updateAlertLevel(drinkId, alertLevel, staffName) {
  try {
    const response = await api.patch(`/stock/${drinkId}/alert-level`, {
      alertLevel,
      staffName,
    })
    return response.data
  } catch (error) {
    throw normalizeError(error, 'Unable to update alert level')
  }
}

export async function addDrink(drinkData, staffName) {
  try {
    const response = await api.post('/stock', {
      ...drinkData,
      staffName,
    })
    return response.data
  } catch (error) {
    throw normalizeError(error, 'Unable to add drink')
  }
}

export async function removeDrink(drinkId) {
  try {
    const response = await api.delete(`/stock/${drinkId}`)
    return response.data
  } catch (error) {
    throw normalizeError(error, 'Unable to remove drink')
  }
}

export async function updateDrinkActive(drinkId, isActive, staffName) {
  try {
    const response = await api.patch(`/stock/${drinkId}/active`, {
      isActive,
      staffName,
    })
    return response.data
  } catch (error) {
    throw normalizeError(error, 'Unable to update drink status')
  }
}

// Staff endpoints
export async function getStaff() {
  try {
    const response = await api.get('/staff')
    return response.data
  } catch (error) {
    throw normalizeError(error, 'Unable to load staff')
  }
}

export async function addStaff(staffData) {
  try {
    const response = await api.post('/staff', staffData)
    return response.data
  } catch (error) {
    throw normalizeError(error, 'Unable to add staff')
  }
}

export async function removeStaff(staffId) {
  try {
    const response = await api.delete(`/staff/${staffId}`)
    return response.data
  } catch (error) {
    throw normalizeError(error, 'Unable to remove staff')
  }
}

export async function resetPin(staffId, newPin) {
  try {
    const response = await api.patch(`/staff/${staffId}/pin`, { newPin })
    return response.data
  } catch (error) {
    throw normalizeError(error, 'Unable to reset PIN')
  }
}

// Logs endpoints
export async function getLogs(filters = {}) {
  try {
    const response = await api.get('/logs', { params: filters })
    return response.data.map((item) => ({
      ...item,
      timestamp: `${item.date}T${convertTimeTo24h(item.time)}:00`,
    }))
  } catch (error) {
    throw normalizeError(error, 'Unable to load logs')
  }
}

// Settings endpoints
export async function getSettings() {
  try {
    const response = await api.get('/settings')
    return response.data
  } catch (error) {
    throw normalizeError(error, 'Unable to load settings')
  }
}

export async function updateShopName(shopName) {
  try {
    const response = await api.patch('/settings/shop-name', { shopName })
    return response.data
  } catch (error) {
    throw normalizeError(error, 'Unable to update shop name')
  }
}

export async function updateCategories(categories) {
  try {
    const response = await api.patch('/settings/categories', { categories })
    return response.data.categories
  } catch (error) {
    throw normalizeError(error, 'Unable to update categories')
  }
}

// Export endpoints
export async function exportDataSnapshot() {
  try {
    const response = await api.get('/export/snapshot')
    return response.data
  } catch (error) {
    throw normalizeError(error, 'Unable to export data')
  }
}

function convertTimeTo24h(timeString) {
  const [timePart, ampmRaw] = String(timeString ?? '').trim().split(' ')
  const [hoursRaw, minutesRaw] = String(timePart ?? '').split(':')
  let hours = Number(hoursRaw)
  const minutes = String(minutesRaw ?? '00').padStart(2, '0')
  const ampm = String(ampmRaw ?? '').toUpperCase()

  if (Number.isNaN(hours)) {
    return '00:00'
  }

  if (ampm === 'PM' && hours < 12) {
    hours += 12
  }
  if (ampm === 'AM' && hours === 12) {
    hours = 0
  }

  return `${String(hours).padStart(2, '0')}:${minutes}`
}
