package mongodb_test

import (
	_repository "AdServer/creative/repository/mongodb"
	_config "AdServer/infrastructure/config"
	_mocks "AdServer/infrastructure/mocks"
	_mongodb "AdServer/infrastructure/mongodb"

	"context"
	"log"
	"os"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/mongo"
)

var db *mongo.Database

func TestMain(m *testing.M) {
	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	cfg, err := _config.New("../../../.env")
	if err != nil {
		log.Panic("❌ load config: ", err)
	}

	infra, err := _mocks.New()
	if err != nil {
		log.Panic("❌ mock service: ", err)
	}
	defer infra.Close()

	dbClient, err := infra.NewMongoDB(ctx, cfg.MongoDB)
	if err != nil {
		log.Panic("❌ connect mongodb: ", err)
	}
	defer _mongodb.Close(dbClient)

	if err := _mongodb.Migrate(dbClient, cfg.MongoDB.DBName, "Creative", "Creative.json"); err != nil {
		log.Panic("❌ migrate mongodb: ", err)
	}

	db = dbClient.Database(cfg.MongoDB.DBName)

	code := m.Run()

	_mongodb.Close(dbClient)
	infra.Close()

	os.Exit(code)
}

func TestGetByID(t *testing.T) {
	repo := _repository.NewCreativeRepository(db)

	id := "creative-62cc3645c78b1223777d8329"
	res, err := repo.GetByID(context.TODO(), id)
	assert.NoError(t, err)
	assert.NotEmpty(t, res)
}

func TestGet(t *testing.T) {
	repo := _repository.NewCreativeRepository(db)

	res, err := repo.Get(context.TODO())
	assert.NoError(t, err)
	assert.NotEmpty(t, res)
	assert.Len(t, res, 1)
}
