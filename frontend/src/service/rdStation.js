import request from 'src/service/request';

// Fetch all contacts (GET request)
export function ListarContatos(apiToken) {
  return request({
    url: `/contacts`,
    method: 'get',
    params: {
      token: apiToken
    }
  });
}

// Create a new contact (POST request)
export function CriarContato(data, apiToken) {
  return request({
    url: '/contacts',
    method: 'post',
    params: {
      token: apiToken
    },
    data
  });
}

// Update a contact (PUT request)
export function AlterarContato(data, apiToken) {
  return request({
    url: `/contacts/${data.id}`,
    method: 'put',
    params: {
      token: apiToken
    },
    data
  });
}

// Delete a contact (DELETE request)
export function DeletarContato(data, apiToken) {
  return request({
    url: `/contacts/${data.id}`,
    method: 'delete',
    params: {
      token: apiToken
    }
  });
}

// Fetch logs for a contact group (GET request)
export function ConsultarLogsContato(params, apiToken) {
  return request({
    url: `/contacts/${params.groupId}/logs`,
    method: 'get',
    params: {
      ...params,
      token: apiToken
    }
  });
}
