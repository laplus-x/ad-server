package config

import (
	"log"
	"strings"

	"github.com/spf13/viper"
)

type Config struct {
	Server Server `mapstructure:"SERVER"`

	// DB
	MongoDB Database `mapstructure:"MONGO"`
	Redis   Database `mapstructure:"REDIS"`

	// MQ
	Kafka MessageQueue `mapstructure:"KAFKA"`
}

type Server struct {
	Debug          bool   `mapstructure:"DEBUG"`
	Domain         string `mapstructure:"DOMAIN"`
	Port           string `mapstructure:"PORT"`
	RequestTimeout int    `mapstructure:"REQUEST_TIMEOUT"`
	ReadTimeout    int    `mapstructure:"READ_TIMEOUT"`
	WriteTimeout   int    `mapstructure:"WRITE_TIMEOUT"`
}

type Database struct {
	User      string   `mapstructure:"USER"`
	Password  string   `mapstructure:"PWD"`
	Addresses []string `mapstructure:"ADDRESSES"`
	DBName    string   `mapstructure:"DB_NAME"`
}

type MessageQueue struct {
	User      string   `mapstructure:"USER"`
	Password  string   `mapstructure:"PWD"`
	Addresses []string `mapstructure:"ADDRESSES"`
	Topic     string   `mapstructure:"TOPIC"`
	Partition int      `mapstructure:"PARTITION"`
}

func New(files ...string) (*Config, error) {
	file := ".env"
	if len(files) > 0 {
		file = files[0]
	}

	viper.SetConfigFile(file)
	replacer := strings.NewReplacer(".", "_")
	viper.SetEnvKeyReplacer(replacer)
	viper.AutomaticEnv()

	viper.SetDefault("SERVER.PORT", "3000")
	viper.SetDefault("SERVER.REQUEST_TIMEOUT", 60)
	viper.SetDefault("SERVER.READ_TIMEOUT", 30)
	viper.SetDefault("SERVER.WRITE_TIMEOUT", 30)

	viper.SetDefault("MONGO.ADDRESSES", []string{"127.0.0.1:27017"})
	viper.SetDefault("REDIS.ADDRESSES", []string{"127.0.0.1:6379"})
	viper.SetDefault("KAFKA.ADDRESSES", []string{"127.0.0.1:9092"})

	if err := viper.ReadInConfig(); err != nil {
		return nil, err
	}

	config := new(Config)
	if err := viper.Unmarshal(config); err != nil {
		return nil, err
	}

	log.Println("✔️ load config")
	return config, nil
}
