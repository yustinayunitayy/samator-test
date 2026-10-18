import Swal from 'sweetalert2'

// Sweet alert button placement
const base = {
  reverseButtons: true,
  focusConfirm: false,
  focusCancel: true,
}

export async function confirmAction(html, confirmText = 'Yes, save', title = 'Please confirm'){
    const result = await Swal.fire({
        ...base,
        title,
        html,
        icon:'question',
        showCancelButton: true,
        cancelButtonText: 'Go back',
        confirmButtonText: confirmText,
    })
    return result.isConfirmed
}


export function showError(error, title = 'Error Occurred, Unable to save') {
  const messages = error.messages ?? [error.message]
  const html = messages.length === 1 ? messages[0] : `<ul>${messages.map((m) => `<li>${m}</li>`).join('')}</ul>`
  return Swal.fire({ ...base, title, html, icon: 'error', confirmButtonText: 'OK' })
}

export function showToast(title) {
  return Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'success',
    title,
    showConfirmButton: false,
    timer: 1800,
    timerProgressBar: true,
  })
}
