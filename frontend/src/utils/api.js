const BASE_URL = import.meta.env.VITE_API_URL ?? ''

async function request(path, options = {}) {
    const response = await fetch(BASE_URL + path, {
        headers: { 'Content-type': 'application/json' },
        ...options
    })

    if (response.ok) {
        return response.json()
    }

    // Error Handling Response
    let errormsg = [`Request Failed: (${response.status}).`]
    try {
        const cause = await response.json()
        if (cause.errors) {
            errormsg = Object.values(cause.errors).flat()
        } else if (cause.title) {
            errormsg = [cause.title]
        }
    } catch {
        // Keep the fallback message
    }

    const error = new Error(errormsg.join(' '))
    throw Object.assign(new Error(errormsg.join(' ')), {
        status: response.status,
        errormsg,
    })
}
// API call
export function getCylinders({ search = '', status = '', page = 1, pageSize = 10 } = {}) {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
    if (search) params.set('search', search)
    if (status) params.set('status', status)
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