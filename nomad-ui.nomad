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
        stagger = "30s"
        max_parallel = 1
    }

    group "servers" {
        # We want one nomad-ui server
        count = 1

        # Create a web front end using a docker image
        task "nomad-ui" {
            driver = "exec"
            config {
                command = "nomad-ui-linux"
            }
            artifact {
              source = "https://github.com/iverberk/nomad-ui/releases/download/v0.1.0/nomad-ui-linux"
              options {
                checksum = "sha256:0335ab507a99dff573cb58395ef52a76e25c7361dffed45a92dbd778d9174a1a"
              }
            }
            service {
                port = "http"
                check {
                    type = "http"
                    path = "/"
                    interval = "10s"
                    timeout = "2s"
                }
            }
            env {
                NOMAD_ADDR = "192.168.250.100"
                NOMAD_PORT = "4646"
            }
            resources {
                cpu = 500
                memory = 512
                network {
                    mbits = 10
                    # Request for a dynamic port
                    port "http" {
                        static = 3000
                    }
                }
            }
        }
    }
}
