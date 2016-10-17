# Example Nomad jobspec for nomad-ui

job "nomad-ui" {
  # Job should run in the US region
  region = "global"

  # Spread tasks between us-west-1 and us-east-1
  datacenters = ["dc1"]

  # run this job globally
  type = "service"

  # Rolling updates should be sequential
  update {
    stagger      = "30s"
    max_parallel = 1
  }

  group "servers" {
    # we want one nomad-ui server
    count = 1

    # create a web front end using a docker image
    task "nomad-ui" {
      constraint {
        attribute = "${attr.kernel.name}"
        value     = "linux"
      }

      driver = "exec"

      config {
        command = "nomad-ui-linux-amd64"
      }

      artifact {
        source = "https://github.com/iverberk/nomad-ui/releases/download/v0.2.1/nomad-ui-linux-amd64"

        options {
          checksum = "sha256:4b6f0394698d45fcce05c536442b35b5ff83736cd6050d1c50c2a3959937dd14"
        }
      }

      service {
        port = "http"

        check {
          type     = "http"
          path     = "/"
          interval = "10s"
          timeout  = "2s"
        }
      }

      env {
        NOMAD_ADDR = "http://nomad.service.consul:4646"
      }

      resources {
        cpu    = 500
        memory = 512

        network {
          mbits = 10

          # request for a static port
          port "http" {
            static = 3000
          }

          # use a dynamic port
          # port "http" {}
        }
      }
    }
  }
}
