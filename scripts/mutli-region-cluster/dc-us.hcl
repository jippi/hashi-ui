log_level = "INFO"

region = "us"

data_dir = "/tmp/server2"

server {
  enabled          = true
  bootstrap_expect = 1
}

ports {
  http = 5656
  rpc  = 4747
  serf = 4748
}
