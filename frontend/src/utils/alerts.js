import Swal from 'sweetalert2'

export async function confirmAction(html, confirmText='Save'){
    const result = await Swal.fire({
        title:'Confirm',
        html,
        icon:'question',
        showCancelButton: true,
        confirmButtonText:confirmText,
    })
    return result.isConfirmed
}

export function showError(messages, title='Error Occurred'){
    const list = messages.map((m) => `<li>${m}</li>`).join('')
    const html = messages.length === 1 ? messages[0] : `<ul style="text-align:left>${list}</ul>`
    return Swal.fire({
        title, html, icon:'error'
    })
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
