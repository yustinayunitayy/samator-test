const BASE_URL = import.meta.env.VITE_API_URL ?? ''
const OFFLINE_MESSAGE = "Couldn't reach the server, please try again."

async function request(path, options = {}) {

    // Connection issue handler
    let response
    try {
        response = await fetch(BASE_URL + path, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
        })
    } catch {
        throw Object.assign(new Error(OFFLINE_MESSAGE), { status: 0, messages: [OFFLINE_MESSAGE] })
    }

    if (response.ok) {
        return response.json()
    }

    // Error Handling Response
    let messages = [`Request failed with status ${response.status}.`]
    try {
        const problem = await response.json()
        if (problem.errors) {
        messages = Object.values(problem.errors).flat()
        } else if (problem.title) {
        messages = [problem.title]
        }
    } catch {
        // Keep the fallback message
    }

    throw Object.assign(new Error(messages.join(' ')), { status: response.status, messages })
}

// API call
export function getCylinders({ search = '', status = '', page = 1, pageSize = 10, idleOnly = false } = {}) {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
    if (search) params.set('search', search)
    if (status) params.set('status', status)
    if (idleOnly) params.set('idleOnly', 'true')
    return request(`/api/cylinders?${params}`)
}

export function getCylinder(id) {
    return request(`/api/cylinders/${id}`)
}

export function createCylinder(body) {
    return request('/api/cylinders', { method: 'POST', body: JSON.stringify(body) })
}

export function updateCylinder(id, body) {
    return request(`/api/cylinders/${id}`, { method: 'PUT', body: JSON.stringify(body) })
}

export function changeStatus(id, body) {
    return request(`/api/cylinders/${id}/status`, { method: 'POST', body: JSON.stringify(body) })
}

export function getSummary() {
    return request('/api/cylinders/summary')
}