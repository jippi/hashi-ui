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
    value       = "test" # [ test | live ]
  }

  group "ui" {
    count = 3

    vault {
        change_mode = "noop"
        env = false
        policies = ["read-secrets"]
    }

    task "nomad" {
      driver = "docker"

      config {
        image = "jippi/hashi-ui"
        port_map {
            nomad  = 3000 # container port: static
        }

        volumes = [
            "local/secrets/hashi-ui.env:/etc/hashi-ui/vault.env"
        ]

        // logging {
        //   type = "syslog"
        //   config {
        //     tag = "nomad-ui"
        //   }
        // }
      }

      service {
        name = "${TASK}-ui"
        port = "nomad"
        check {
          type     = "http"
          path     = "/"
          interval = "20s"
          timeout  = "3s"
        }
      }

      template {
          data = <<EOF
{{ with printf "secret/%s" (env "NOMAD_JOB_NAME") | secret }}
export NOMAD_ADDR="{{.Data.NOMAD_ADDR}}"
export NOMAD_ENABLE="{{.Data.NOMAD_ENABLE}}"
{{ end }}
EOF
          destination = "local/secrets/hashi-ui.env"
          # Send a configurable signal to the task
          change_mode   = "signal"
          change_signal = "SIGINT"
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
