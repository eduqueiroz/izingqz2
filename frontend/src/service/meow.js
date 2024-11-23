import request from 'src/service/request'

export function EnviarMensagemMeow (ticketId, data) {
  return request({
    url: `/meow-message/${ticketId}`,
    method: 'post',
    data
  })
}

export function EnviarReacaoMeow (ticketId, data) {
  return request({
    url: `/meow-react/${ticketId}`,
    method: 'post',
    data
  })
}

export function EnviarEdicaoMeow (ticketId, data) {
  return request({
    url: `/meow-edition/${ticketId}`,
    method: 'post',
    data
  })
}

export function QRCodeMeow (data) {
  return request({
    url: `/meow-qrcode/${data.wabaId}`,
    method: 'post',
    data
  })
}