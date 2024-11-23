import request from 'src/service/request';

export function criarCliente(data) {
  return request({
    url: '/asaas/client',
    method: 'post',
    data
  });
}

export function criarAssinatura(data) {
  return request({
    url: '/asaas/subscription',
    method: 'post',
    data
  });
}

export function deletarCliente(clientId) {
  return request({
    url: `/asaas/client/${clientId}`,
    method: 'delete'
  });
}

export function listarAssinaturas(params) {
  return request({
    url: '/asaas/subscriptions',
    method: 'get',
    params
  });
}

export function atualizarAssinatura(subscriptionId, data) {
  return request({
    url: `/asaas/subscription/${subscriptionId}`,
    method: 'put',
    data
  });
}
