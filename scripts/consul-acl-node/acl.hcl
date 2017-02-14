key "" {
  policy = "read"
}

key "lock/" {
  policy = "write"
}

key "cronsul/" {
  policy = "write"
}

key "docker-swarm/" {
  policy = "write"
}

service "" {
  policy = "write"
}
