package redis

import (
	"AdServer/infrastructure/config"
	"context"
	"log"
	"time"

	"github.com/go-redis/redis"
)

func New(ctx context.Context, cfg config.Database) (*redis.Client, error) {
	opt := redis.Options{
		Addr:     cfg.Addresses[0],
		Password: cfg.Password,
	}

	timeout, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	client := redis.NewClient(&opt).WithContext(timeout)
	if _, err := client.Ping().Result(); err != nil {
		return nil, err
	}

	log.Println("✔️ connect redis", cfg.Addresses)
	return client, nil

}

func Close(client *redis.Client) {
	if err := client.Close(); err != nil {
		log.Println(err)
	}
}
