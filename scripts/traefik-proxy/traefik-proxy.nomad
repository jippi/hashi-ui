job "traefik" {
  region      = "global"
  datacenters = ["dc1"]
  type        = "service"

  group "traefik" {
    count = 1

    task "traefik" {
      driver = "docker"

      config {
        image = "traefik:v1.1.2"

        args = [
          "--accesslogsfile=/dev/stdout",
          "--web",
          "--consulcatalog",
          "--consulcatalog.endpoint=172.16.137.186:8500",
        ]

        port_map {
          admin = 8080
          http  = 80
        }
      }

      resources {
        cpu    = 200 # Mhz
        memory = 50  # MB

        network {
          mbits = 10

          port "http" {
            static = 30000
          }

          port "admin" {
            static = 8080
          }
        }
      }
    }

    task "nomad-ui-prefix" {
      driver = "docker"

      config {
        image = "jippi/hashi-ui:pr-204"

        port_map {
          http = 3000
        }
      }

      env {
        LOG_LEVEL     = "debug"
        PROXY_ADDRESS = "/hashi-ui"

        CONSUL_ENABLE = "true"
        CONSUL_ADDR   = "172.16.137.186:8500"

        NOMAD_ENABLE = "true"
        NOMAD_ADDR   = "http://172.16.137.186:4646"
      }

      service {
        name = "nomad-ui-prefix"
        port = "http"

        tags = [
          "traefik.frontend.rule=PathPrefixStrip: /hashi-ui",
        ]
      }

      resources {
        cpu    = 200 # Mhz
        memory = 200 # MB

        network {
          mbits = 10
          port  "http"{}
        }
      }
    }
  }
}
