job "hashi-ui" {
  region        = "us-west-2"
  datacenters   = ["us-west-2"]
  type          = "service"

  update {
   stagger      = "20s"
   max_parallel = 1
  }

  constraint {
      attribute = "${meta.hood}"
      value     = "shared" # [ corp | prod | shared ]
  }

  constraint {
    attribute   = "${meta.env_type}"
    value       = "<ENV_TYPE>" # [ test | live ]
  }

  group "nomad-ui" {
    count = 1

    task "nomad-hashi-ui" {
      driver = "docker"

      env {
        "NOMAD_ENABLE" = "1"
        "NOMAD_ADDR"   = "http://nomad.service.owf-dev:4646"
      }

      config {
        image = "jippi/hashi-ui"
        port_map {
            nomad  = 3000 # container port: static
        }
        logging {
          type = "syslog"
          config {
            tag = "nomad-ui"
          }
        }
      }

      service {
        name = "nomad-${JOB}"
        port = "nomad"
        check {
          type     = "http"
          path     = "/"
          interval = "20s"
          timeout  = "3s"
        }
      }

      resources {
        cpu     = 500  # MHz
        memory  = 256  # MB
        network {
          mbits = 10
          port "nomad" {} # host port: dynamic
        }
      }
    } // end task.nomad-hashi-ui
  } // end group.nomad-ui
}
