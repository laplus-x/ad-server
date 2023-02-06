package cache_test

import (
	_repository "AdServer/creative/repository/cache"
	"AdServer/domain"
	_cache "AdServer/infrastructure/cache"

	"context"
	"log"
	"os"
	"testing"
	"time"

	"github.com/allegro/bigcache/v3"
	"github.com/stretchr/testify/assert"
)

var cache *bigcache.BigCache

func TestMain(m *testing.M) {
	var err error
	cache, err = _cache.New(time.Minute)
	if err != nil {
		log.Panic("❌ create cache", err)
	}
	defer _cache.Close(cache)

	code := m.Run()

	_cache.Close(cache)

	os.Exit(code)
}

func TestGet(t *testing.T) {
	repo := _repository.NewCreativeRepository(cache)

	id := "creative-62cc3645c78b1223777d8329"
	res, err := repo.Get(context.TODO(), id)
	assert.NoError(t, err)
	assert.NotEmpty(t, res)
	assert.Len(t, res, 1)
}

func TestSet(t *testing.T) {
	repo := _repository.NewCreativeRepository(cache)

	id := "creative-62cc3645c78b1223777d8329"
	data := &domain.Creative{
		Name: "test",
		Type: domain.CreativeTypeBanner,
	}
	err := repo.Set(context.TODO(), id, data)
	assert.NoError(t, err)
}
