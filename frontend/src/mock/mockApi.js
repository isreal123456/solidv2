import { format } from 'date-fns'
import {
  APP_TODAY,
  drinkCategories,
  drinksData,
  logsData,
  salesData,
  shopProfile,
  staffData,
} from './mockData'

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms))
const clone = (value) => JSON.parse(JSON.stringify(value))
const now = () => new Date()
const todayDate = () => APP_TODAY
const currentTime = () => format(now(), 'hh:mm a')
const currentTimestamp = () => now().toISOString()
const createId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const state = {
  shopName: shopProfile.shopName,
  categories: [...drinkCategories],
  staff: clone(staffData),
  drinks: clone(drinksData),
  sales: clone(salesData),
  logs: clone(logsData),
}

const addLog = (staffName, action, details) => {
  state.logs.push({
    id: createId('log'),
    staffName,
    action,
    details,
    timestamp: currentTimestamp(),
  })
}

const normalize = (value) => String(value ?? '').trim().toLowerCase()
const toNumber = (value) => Number(value)

const withinRange = (timestamp, fromDate, toDate) => {
  const current = timestamp.slice(0, 10)
  if (fromDate && current < fromDate) return false
  if (toDate && current > toDate) return false
  return true
}

export async function login(name, pin) {
  await delay()
  const staffMember = state.staff.find(
    (item) => normalize(item.name) === normalize(name) && String(item.pin) === String(pin),
  )

  if (!staffMember) {
    throw new Error('Invalid name or PIN')
  }

  staffMember.lastLogin = currentTimestamp()
  addLog(staffMember.name, 'login', 'Signed in successfully')

  return {
    id: staffMember.id,
    name: staffMember.name,
    role: staffMember.role,
  }
}

export async function logout(staffName) {
  await delay()
  addLog(staffName, 'logout', 'Signed out successfully')
  return true
}

export async function getSales(filters = {}) {
  await delay()
  const { staffName, drinkName, date, fromDate, toDate } = filters

  const items = state.sales.filter((sale) => {
    const matchesStaff = !staffName || sale.staffName.toLowerCase().includes(normalize(staffName))
    const matchesDrink = !drinkName || sale.drinkName.toLowerCase().includes(normalize(drinkName))
    const matchesDate = !date || sale.date === date
    const matchesStart = !fromDate || sale.date >= fromDate
    const matchesEnd = !toDate || sale.date <= toDate
    return matchesStaff && matchesDrink && matchesDate && matchesStart && matchesEnd
  })

  return clone(items)
}

export async function recordSale(staffId, staffName, drinkId, quantity) {
  await delay()
  const saleQuantity = toNumber(quantity)
  if (!saleQuantity || saleQuantity < 1) {
    throw new Error('Quantity must be at least 1')
  }

  const staffMember = state.staff.find((item) => item.id === staffId)
  if (!staffMember) {
    throw new Error('Staff member not found')
  }

  const drink = state.drinks.find((item) => item.id === drinkId)
  if (!drink) {
    throw new Error('Drink not found')
  }

  if (drink.stock < saleQuantity) {
    throw new Error(`${drink.name} is low on stock`)
  }

  drink.stock -= saleQuantity

  const sale = {
    id: createId('sale'),
    staffId: staffMember.id,
    staffName: staffMember.name,
    drinkId: drink.id,
    drinkName: drink.name,
    quantity: saleQuantity,
    price: drink.price,
    total: drink.price * saleQuantity,
    date: todayDate(),
    time: currentTime(),
  }

  state.sales.push(sale)
  addLog(staffMember.name, 'sale', `Recorded sale for ${saleQuantity} ${drink.name}`)
  return clone(sale)
}

export async function getStock() {
  await delay()
  return clone(state.drinks)
}

export async function updateStock(drinkId, newQuantity, staffName) {
  await delay()
  const drink = state.drinks.find((item) => item.id === drinkId)
  if (!drink) {
    throw new Error('Drink not found')
  }

  drink.stock = Math.max(0, toNumber(newQuantity))
  addLog(staffName, 'stock', `Updated stock for ${drink.name} to ${drink.stock}`)
  return clone(drink)
}

export async function updateAlertLevel(drinkId, alertLevel, staffName) {
  await delay()
  const drink = state.drinks.find((item) => item.id === drinkId)
  if (!drink) {
    throw new Error('Drink not found')
  }

  drink.alertLevel = Math.max(0, toNumber(alertLevel))
  addLog(staffName, 'edit', `Updated alert level for ${drink.name} to ${drink.alertLevel}`)
  return clone(drink)
}

export async function addDrink(drinkData, staffName) {
  await delay()
  const drink = {
    id: createId('drink'),
    name: drinkData.name?.trim(),
    category: drinkData.category?.trim(),
    price: toNumber(drinkData.price),
    stock: Math.max(0, toNumber(drinkData.stock)),
    alertLevel: Math.max(0, toNumber(drinkData.alertLevel ?? 0)),
  }

  if (!drink.name || !drink.category || Number.isNaN(drink.price)) {
    throw new Error('Please provide a valid drink name, category, and price')
  }

  state.drinks.push(drink)
  if (!state.categories.includes(drink.category)) {
    state.categories.push(drink.category)
  }
  addLog(staffName, 'edit', `Added new drink ${drink.name}`)
  return clone(drink)
}

export async function getStaff() {
  await delay()
  return clone(state.staff)
}

export async function addStaff(staffData) {
  await delay()
  const staffMember = {
    id: createId('staff'),
    name: staffData.name?.trim(),
    pin: String(staffData.pin ?? '').trim(),
    role: staffData.role === 'admin' ? 'admin' : 'staff',
    createdAt: currentTimestamp(),
    lastLogin: null,
  }

  if (!staffMember.name || staffMember.pin.length < 4) {
    throw new Error('Staff name and 4-digit PIN are required')
  }

  state.staff.push(staffMember)
  addLog(staffMember.name, 'staff', `Added ${staffMember.name} as ${staffMember.role}`)
  return clone(staffMember)
}

export async function removeStaff(staffId) {
  await delay()
  const index = state.staff.findIndex((item) => item.id === staffId)
  if (index === -1) {
    throw new Error('Staff member not found')
  }

  const [removed] = state.staff.splice(index, 1)
  addLog('Granny', 'staff', `Removed ${removed.name} from staff roster`)
  return clone(removed)
}

export async function resetPin(staffId, newPin) {
  await delay()
  const staffMember = state.staff.find((item) => item.id === staffId)
  if (!staffMember) {
    throw new Error('Staff member not found')
  }

  staffMember.pin = String(newPin ?? '').trim()
  if (staffMember.pin.length < 4) {
    throw new Error('PIN must contain at least 4 digits')
  }

  addLog('Granny', 'staff', `Reset PIN for ${staffMember.name}`)
  return clone(staffMember)
}

export async function getLogs(filters = {}) {
  await delay()
  const { staffName, action, date, fromDate, toDate } = filters

  const items = state.logs.filter((log) => {
    const matchesStaff = !staffName || log.staffName.toLowerCase().includes(normalize(staffName))
    const matchesAction = !action || log.action === action
    const matchesDate = !date || log.timestamp.slice(0, 10) === date
    const matchesStart = !fromDate || withinRange(log.timestamp, fromDate, null)
    const matchesEnd = !toDate || withinRange(log.timestamp, null, toDate)
    return matchesStaff && matchesAction && matchesDate && matchesStart && matchesEnd
  })

  return clone(items)
}

export async function getSettings() {
  await delay()
  return {
    shopName: state.shopName,
    categories: clone(state.categories),
  }
}

export async function updateShopName(shopName) {
  await delay()
  const nextName = String(shopName ?? '').trim()
  if (!nextName) {
    throw new Error('Shop name is required')
  }

  state.shopName = nextName
  addLog('Granny', 'edit', `Updated shop name to ${nextName}`)
  return { shopName: state.shopName }
}

export async function updateCategories(categories) {
  await delay()
  state.categories = clone(Array.from(new Set(categories.map((item) => String(item).trim()).filter(Boolean))))
  addLog('Granny', 'edit', 'Updated drink categories list')
  return clone(state.categories)
}

export async function exportDataSnapshot() {
  await delay(0)
  return {
    settings: await getSettings(),
    staff: await getStaff(),
    drinks: await getStock(),
    sales: await getSales(),
    logs: await getLogs(),
  }
}
