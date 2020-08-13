mutation {
  createOneUser(data: {email: "sadsad", name: "tqt"}) {
    id
  }
}


query Post {
  user(where: {id: 1}) {
    id
    name
  }
}
