# Example Nomad jobspec for hashi-ui

job "hashi-ui" {
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
    # we want one hashi-ui server
    count = 1

    # create a web front end using a docker image
    task "hashi-ui" {
      constraint {
        attribute = "${attr.kernel.name}"
        value     = "linux"
      }

      driver = "exec"

      config {
        command = "hashi-ui-linux-amd64"
      }

      artifact {
        source = "https://github.com/jippi/hashi-ui/releases/download/v0.13.0/hashi-ui-linux-amd64"
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
        NOMAD_ENABLE = 1
        NOMAD_ADDR   = "http://nomad.service.consul:4646"
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
