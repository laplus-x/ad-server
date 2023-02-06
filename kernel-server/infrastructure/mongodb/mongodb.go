package mongodb

import (
	"AdServer/infrastructure/config"

	"context"
	"embed"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/mongodb"
	"github.com/golang-migrate/migrate/v4/source/iofs"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

//go:embed migrations/*.json
var fs embed.FS

func NewClient(ctx context.Context, cfg config.Database) (*mongo.Client, error) {
	uri := fmt.Sprintf("mongodb://%s", strings.Join(cfg.Addresses, ","))
	opt := options.Client().ApplyURI(uri).SetReadPreference(readpref.Nearest()).
		SetMaxPoolSize(300).SetMaxConnIdleTime(60 * time.Second)

	if cfg.User != "" && cfg.Password != "" {
		credential := options.Credential{
			Username: cfg.User,
			Password: cfg.Password,
		}
		opt.SetAuth(credential)
	}

	timeout, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(timeout, opt)
	if err != nil {
		return nil, err
	}

	if err := client.Ping(timeout, readpref.Nearest()); err != nil {
		return nil, err
	}

	log.Println("✔️ connect mongodb", cfg.Addresses)
	return client, nil
}

func Close(client *mongo.Client) {
	if err := client.Disconnect(context.Background()); err != nil {
		log.Println(err)
	}
}

func Migrate(client *mongo.Client, db, collection, filename string) error {
	driver, err := mongodb.WithInstance(client, &mongodb.Config{
		DatabaseName: db,
	})
	if err != nil {
		return err
	}

	d, err := iofs.New(fs, "migrations")
	if err != nil {
		return err
	}
	m, err := migrate.NewWithInstance("iofs", d, "mongodb", driver)
	if err != nil {
		return err
	}
	return m.Up()
}
