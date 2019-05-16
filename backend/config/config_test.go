package config

import (
	"reflect"
	"testing"
)

func TestConfig_correctDefaulValues(t *testing.T) {
	config := DefaultConfig()

	expected := &Config{
		LogLevel:      "info",
		ListenAddress: "0.0.0.0:3000",

		NomadReadOnly:    false,
		NomadAddress:     "http://127.0.0.1:4646",
		NomadHideEnvData: false,
		NomadColor:       "#4b9a7d",
		SiteTitle:        "",

		NewRelicEnable:  false,
		NewRelicAppName: "hashi-ui",

		ConsulReadOnly: false,
		ConsulAddress:  "127.0.0.1:8500",
		ConsulColor:    "#694a9c",
	}

	if !reflect.DeepEqual(config, expected) {
		t.Fatalf("expected \n%#v\n\n, got \n\n%#v\n\n", expected, config)
	}
}
