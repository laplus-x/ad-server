package mocks

import (
	"AdServer/infrastructure/config"
	_mongodb "AdServer/infrastructure/mongodb"

	"context"
	"log"

	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/ory/dockertest/v3"
	"github.com/ory/dockertest/v3/docker"
	"go.mongodb.org/mongo-driver/mongo"
)

type infrastructure struct {
	pool      *dockertest.Pool
	resources []*dockertest.Resource
}

func New() (*infrastructure, error) {
	pool, err := dockertest.NewPool("")
	if err != nil {
		return nil, err
	}

	log.Println("✔️ mock service")
	return &infrastructure{
		pool: pool,
	}, nil
}

func (infra *infrastructure) Close() {
	for _, res := range infra.resources {
		if err := infra.pool.Purge(res); err != nil {
			log.Println("Could not purge resource: ", err)
		}
	}
}

func (infra *infrastructure) NewMongoDB(ctx context.Context, cfg config.Database) (*mongo.Client, error) {
	opt := dockertest.RunOptions{
		Name:       "adserver_mongo",
		Repository: "mongo",
		Tag:        "5",
		Env: []string{
			"MONGO_INITDB_ROOT_USERNAME:" + cfg.User,
			"MONGO_INITDB_ROOT_PASSWORD:" + cfg.Password,
			"MONGO_INITDB_DATABASE:" + cfg.DBName,
		},
	}
	res, err := infra.pool.RunWithOptions(&opt, func(config *docker.HostConfig) {
		config.AutoRemove = true
		config.RestartPolicy = docker.RestartPolicy{
			Name: "no",
		}
	})
	if err != nil {
		return nil, err
	}
	infra.resources = append(infra.resources, res)

	cfg.Addresses = []string{"127.0.0.1:" + res.GetPort("27017/tcp")}
	var client *mongo.Client
	if err := infra.pool.Retry(func() error {
		var err error
		client, err = _mongodb.NewClient(ctx, cfg)
		return err
	}); err != nil {
		return nil, err
	}

	return client, nil
}
