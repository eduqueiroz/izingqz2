import request from 'src/service/request'

export function CriarPlano (data) {
  return request({
    url: '/plan/',
    method: 'post',
    data
  })
}

export function ListarPlanos () {
  return request({
    url: `/plan/`,
    method: 'get'
  })
}

export function ListarPlano (data) {
  return request({
    url: `/plan/${data.id}`,
    method: 'get'
  })
}

export function AlterarPlano (data) {
  return request({
    url: `/plan/${data.id}`,
    method: 'put',
    data
  })
}

export function DeletarPlano (data) {
  return request({
    url: `/plan/${data.id}`,
    method: 'delete'
  })
}

export function DeletarTodosPlano () {
  return request({
    url: `/planAll/`,
    method: 'delete'
  })
}