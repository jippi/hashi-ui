job "traefik" {
    region = "global"
    datacenters = ["dc1"]
    type = "service"

    group "traefik" {
        count = 1

        meta {
            consul_addr = "localhost:8500"
        }

        task "traefik" {
            driver = "docker"
            config {
                image = "traefik:v1.1.2"
                args = [
                    "--accesslogsfile=/dev/stdout",
                    "--web",
                    "--consulcatalog",
                    "--consulcatalog.endpoint=${meta.consul_addr}",
                    "--consulcatalog.domain=service.consul",
                    "--consulcatalog.constraints=tag==http",
                ]
                port_map {
                    admin = 8080
                    http  = 80
                }
            }

            resources {
                cpu = 200 # Mhz
                memory = 50 # MB
                network {
                    mbits = 10
                    port "http"  {
                        static = 30000
                    }
                    port "admin" {}
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
                NOMAD_ENABLE    = "true"
                NOMAD_ADDR      = "http://nomad.service.consul:4646"
                NOMAD_LOG_LEVEL = "debug"
                NOMAD_READ_ONLY = "false"
                PROXY_ADDRESS   = "/hashi-ui"

                CONSUL_ENABLE    = "true"
                CONSUL_ADDR      = "${meta.consul_addr}"
                CONSUL_READ_ONLY = "true"
            }

            service {
                name = "nomad-ui-prefix"
                port = "http"
                tags = [
                    "traefik.tags=http",
                    "traefik.frontend.rule=PathPrefixStrip: /hashi-ui",
                ]
            }

            resources {
                cpu = 200 # Mhz
                memory = 200 # MB
                network {
                    mbits = 10
                    port "http"  {}
                }
            }
        }

    }
}
