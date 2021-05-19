package main

import (
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/gorilla/mux"
	consul "github.com/hashicorp/consul/api"
	nomad "github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/config"
	consul_helper "github.com/jippi/hashi-ui/backend/consul/helper"
	nomad_helper "github.com/jippi/hashi-ui/backend/nomad/helper"
	newrelic "github.com/newrelic/go-agent"
	log "github.com/sirupsen/logrus"
)

var (
	GitCommit string // Filled in by the compiler
	AppConfig *config.Config
)

func startLogging(logLevel string) {
	level, err := log.ParseLevel(logLevel)
	if err != nil {
		fmt.Printf("%s (%s)", err, logLevel)
		os.Exit(1)
	}

	log.SetLevel(level)
}

func main() {
	cfg := config.DefaultConfig()
	cfg.Parse()

	AppConfig = cfg

	startLogging(cfg.LogLevel)

	if os.Getenv("LOG_FORMAT") == "json" {
		log.SetFormatter(&log.JSONFormatter{
			FieldMap: log.FieldMap{
				log.FieldKeyTime:  "@timestamp",
				log.FieldKeyLevel: "@level",
				log.FieldKeyMsg:   "@message",
			},
		})
	}

	log.Infof("----------------------------------------------------------------------------------")
	log.Infof("|                                 HASHI UI                                       |")
	log.Infof("----------------------------------------------------------------------------------")
	if !cfg.HttpsEnable {
		log.Infof("| listen-address            : http://%-43s |", cfg.ListenAddress)
	} else {
		log.Infof("| listen-address            : https://%-43s  |", cfg.ListenAddress)
	}
	log.Infof("| server-certificate        : %-50s |", cfg.ServerCert)
	log.Infof("| server-key                : %-50s |", cfg.ServerKey)
	log.Infof("| site-title                : %-50s |", cfg.SiteTitle)
	log.Infof("| proxy-address             : %-50s |", cfg.ProxyAddress)
	log.Infof("| log-level                 : %-50s |", cfg.LogLevel)
	log.Infof("| new-relic-enable          : %-50v |", cfg.NewRelicEnable)
	log.Infof("| new-relic-app-name        : %-50s |", cfg.NewRelicAppName)

	if cfg.ThrottleUpdateDuration != nil {
		log.Infof("| throttle-update-duration  : %-50s |", cfg.ThrottleUpdateDuration)
	} else {
		log.Infof("| throttle-update-duration  : %-50s |", "0s")
	}

	// Nomad
	log.Infof("| nomad-enable              : %-50t |", cfg.NomadEnable)
	if cfg.NomadReadOnly {
		log.Infof("| nomad-read-only           : %-50s |", "Yes")
	} else {
		log.Infof("| nomad-read-only           : %-50s |", "No (Hashi-UI can change Nomad state)")
	}
	log.Infof("| nomad-address             : %-50s |", cfg.NomadAddress)
	log.Infof("| nomad-acl-token           : %-50s |", cfg.NomadACLToken)
	log.Infof("| nomad-namespace           : %-50s |", cfg.NomadNamespace)
	log.Infof("| nomad-ca-cert             : %-50s |", cfg.NomadCACert)
	log.Infof("| nomad-client-cert         : %-50s |", cfg.NomadClientCert)
	log.Infof("| nomad-client-key          : %-50s |", cfg.NomadClientKey)
	log.Infof("| nomad-skip-verify         : %-50t |", cfg.NomadSkipVerify)
	log.Infof("| nomad-hide-env-data       : %-50v |", cfg.NomadHideEnvData)
	if cfg.NomadSkipVerify {
		log.Infof("| nomad-skip-verify         : %-50s |", "Yes")
	} else {
		log.Infof("| nomad-skip-verify         : %-50s |", "No")
	}
	if cfg.NomadAllowStale {
		log.Infof("| nomad-allow-stale         : %-50s |", "Yes")
	} else {
		log.Infof("| nomad-allow-stale         : %-50s |", "No")
	}
	log.Infof("| nomad-color               : %-50s |", cfg.NomadColor)

	// Consul
	log.Infof("| consul-enable             : %-50t |", cfg.ConsulEnable)
	if cfg.ConsulReadOnly {
		log.Infof("| consul-read-only          : %-50s |", "Yes")
	} else {
		log.Infof("| consul-read-only          : %-50s |", "No (Hashi-UI can change Consul state)")
	}
	log.Infof("| consul-address            : %-50s |", cfg.ConsulAddress)
	log.Infof("| consul-acl-token          : %-50s |", cfg.ConsulACLToken)
	log.Infof("| consul-color              : %-50s |", cfg.ConsulColor)

	log.Infof("----------------------------------------------------------------------------------")
	log.Infof("")

	if !cfg.NomadEnable && !cfg.ConsulEnable {
		log.Fatal("Please enable at least Consul (--consul-enable) or Nomad (--nomad-enable)")
	}

	myAssetFS := assetFS()
	router := mux.NewRouter()

	var app newrelic.Application

	if cfg.NewRelicEnable {
		config := newrelic.NewConfig(cfg.NewRelicAppName, cfg.NewRelicLicenseKey)
		var err error
		app, err = newrelic.NewApplication(config)
		if err != nil {
			log.Fatalf("Could not create NewRelic application: %v", err)
		}
	}

	// create clients
	var nomadClient *nomad.Client
	var consulClient *consul.Client

	if cfg.NomadEnable {
		var err error

		log.Info("Connecting to Nomad ...")
		nomadClient, err = nomad_helper.NewRegionClient(cfg, "")
		if err != nil {
			log.Fatalf("Unable to create Nomad client: %s", err)
		}
		if _, err := nomadClient.Status().Leader(); err != nil {
			log.Fatalf("Unable to communicate with Nomad: %s", err)
		}
		log.Info("done!")
	}

	if cfg.ConsulEnable {
		var err error

		log.Info("Connecting to Consul ...")
		consulClient, err = consul_helper.NewDatacenterClient(cfg, "")
		if err != nil {
			log.Fatalf("Unable to create Consul client: %s", err)
		}
		if _, err := consulClient.Status().Leader(); err != nil {
			log.Fatalf("Unable to communicate with Consul: %s", err)
		}
		log.Info("done!")
	}

	// setup http handlers

	if cfg.NomadEnable {
		router.HandleFunc(newrelic.WrapHandleFunc(app, "/", func(w http.ResponseWriter, r *http.Request) {
			log.Infof("Redirecting / to /nomad")
			w.Write([]byte("<script>document.location.href='" + cfg.ProxyPath + "nomad'</script>"))
			return
		}))

		router.HandleFunc(newrelic.WrapHandleFunc(app, "/ws/nomad", NomadHandler(cfg, nomadClient, consulClient)))
		router.HandleFunc(newrelic.WrapHandleFunc(app, "/ws/nomad/{region}", NomadHandler(cfg, nomadClient, consulClient)))
		router.HandleFunc(newrelic.WrapHandleFunc(app, "/api/nomad/{region}", NomadAPIHandler(cfg, nomadClient, consulClient)))
		router.HandleFunc(newrelic.WrapHandleFunc(app, "/nomad/{region}/download/{path:.*}", NomadDownloadFile(cfg)))
	}

	if cfg.ConsulEnable {
		if !cfg.NomadEnable {
			router.HandleFunc(newrelic.WrapHandleFunc(app, "/", func(w http.ResponseWriter, r *http.Request) {
				log.Infof("Redirecting / to /consul")
				http.Redirect(w, r, cfg.ProxyPath+"consul", 302)
			}))
		}

		router.HandleFunc(newrelic.WrapHandleFunc(app, "/ws/consul", ConsulHandler(cfg, nomadClient, consulClient)))
		router.HandleFunc(newrelic.WrapHandleFunc(app, "/ws/consul/{region}", ConsulHandler(cfg, nomadClient, consulClient)))
	}

	router.HandleFunc(newrelic.WrapHandleFunc(app, "/_status", StatusHandler(cfg, nomadClient, consulClient)))

	router.PathPrefix("/").HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		responseFile := "/index.html"

		if idx := strings.Index(r.URL.Path, "static/"); idx != -1 {
			responseFile = r.URL.Path[idx:]
		}

		if idx := strings.Index(r.URL.Path, "favicon.png"); idx != -1 {
			responseFile = "/favicon.png"
		}

		if idx := strings.Index(r.URL.Path, "config.js"); idx != -1 {
			response := make([]string, 0)
			response = append(response, "window.HASHI_DEV=false")
			response = append(response, fmt.Sprintf("window.GIT_HASH='%s'", GitCommit))

			response = append(response, fmt.Sprintf("window.CONSUL_ENABLED=%s", strconv.FormatBool(cfg.ConsulEnable)))
			response = append(response, fmt.Sprintf("window.CONSUL_READ_ONLY=%s", strconv.FormatBool(cfg.ConsulReadOnly)))

			response = append(response, fmt.Sprintf("window.NOMAD_ENABLED=%s", strconv.FormatBool(cfg.NomadEnable)))
			response = append(response, fmt.Sprintf("window.NOMAD_READ_ONLY=%s", strconv.FormatBool(cfg.NomadReadOnly)))

			response = append(response, fmt.Sprintf("window.NOMAD_COLOR='%s'", cfg.NomadColor))
			response = append(response, fmt.Sprintf("window.CONSUL_COLOR='%s'", cfg.ConsulColor))
			response = append(response, fmt.Sprintf("window.SITE_TITLE='%s'", cfg.SiteTitle))

			enabledServices := make([]string, 0)
			if cfg.ConsulEnable {
				enabledServices = append(enabledServices, "'consul'")
			}
			if cfg.NomadEnable {
				enabledServices = append(enabledServices, "'nomad'")
			}

			response = append(response, fmt.Sprintf("window.ENABLED_SERVICES=[%s]", strings.Join(enabledServices, ",")))
			response = append(response, fmt.Sprintf("window.HASHI_PATH_PREFIX='%s';", cfg.ProxyPath))
			response = append(response, "window.HASHI_ENDPOINT_PORT=window.HASHI_ENDPOINT_PORT || document.location.port")

			w.Header().Set("Content-Type", "application/javascript")

			// never ever cache config.js
			w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
			w.Header().Set("Pragma", "no-cache")
			w.Header().Set("Expires", "0")

			w.Write([]byte(strings.Join(response, "\n")))
			return
		}

		if bs, err := myAssetFS.Open(responseFile); err != nil {
			log.Errorf("%s: %s", responseFile, err)
		} else {
			stat, err := bs.Stat()
			if err != nil {
				w.WriteHeader(http.StatusNotFound)
				log.Errorf("Failed to stat %s: %s", responseFile, err)
			} else {
				http.ServeContent(w, r, responseFile[1:], stat.ModTime(), bs)
			}
		}
	})

	log.Infof("Listening ...")
	var err error
	if cfg.HttpsEnable {
		if cfg.ServerCert == "" || cfg.ServerKey == "" {
			log.Fatal("Using https protocol but server certificate or key were not specified.")
		}
		err = http.ListenAndServeTLS(cfg.ListenAddress, cfg.ServerCert, cfg.ServerKey, router)
	} else {
		err = http.ListenAndServe(cfg.ListenAddress, router)
	}
	if err != nil {
		log.Fatal(err)
	}
}
