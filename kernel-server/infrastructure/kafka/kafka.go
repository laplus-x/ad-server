package kafka

import (
	"AdServer/infrastructure/config"
	"log"

	"context"

	"github.com/segmentio/kafka-go"
)

func NewClient(ctx context.Context, cfg config.MessageQueue) (*kafka.Conn, error) {
	conn, err := kafka.DialLeader(ctx, "tcp", cfg.Addresses[0], cfg.Topic, cfg.Partition)
	if err != nil {
		return nil, err
	}
	return conn, nil
}

func Close(conn *kafka.Conn) {
	if err := conn.Close(); err != nil {
		log.Println(err)
	}
}
