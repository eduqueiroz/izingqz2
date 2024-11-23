import request from 'src/service/request'

export function UpdateName (data) {
  return request({
    url: '/custom/updateName',
    method: 'post',
    data
  })
}

export function UploadLogo (data) {
  return request({
    url: '/custom/uploadLogo',
    method: 'post',
    data
  })
}

export function UploadIcon (data) {
  return request({
    url: '/custom/uploadIcon',
    method: 'post',
    data
  })
}

export function Build (data) {
  return request({
    url: '/custom/build',
    method: 'post',
    data
  })
}

export function MigrarArquivos (data) {
  return request({
    url: '/custom/migrate',
    method: 'post',
    data
  })
}

export function LimparArquivos (data) {
  return request({
    url: '/custom/clean',
    method: 'post',
    data
  })
}

export function LimparArquivosTenant (data) {
  return request({
    url: '/custom/cleanTenant',
    method: 'post',
    data
  })
}

export function CalcularArquivosTenant (data) {
  return request({
    url: '/custom/sizeTenant',
    method: 'post',
    data
  })
}

export function UploadZip (data) {
  return request({
    url: '/custom/uploadZip',
    method: 'post',
    data
  })
}

export function Update (data) {
  return request({
    url: '/custom/update',
    method: 'post',
    data
  })
}