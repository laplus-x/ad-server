package repository

import (
	"AdServer/creative/repository/cache"
	"AdServer/creative/repository/mongodb"
	"AdServer/domain"

	"context"

	"github.com/allegro/bigcache/v3"
	"go.mongodb.org/mongo-driver/mongo"
)

type creative struct {
	db    mongodb.CreativeRepository
	cache cache.CreativeRepository
}

func NewCreativeRepository(db *mongo.Database, bc *bigcache.BigCache) *creative {
	return &creative{
		db:    mongodb.NewCreativeRepository(db),
		cache: cache.NewCreativeRepository(bc),
	}
}

func (repo *creative) Sync(ctx context.Context) error {
	creatives, err := repo.db.Get(ctx)
	if err != nil {
		return err
	}
	for _, c := range creatives {
		if err := repo.cache.Set(ctx, c.ID, &c); err != nil {
			return err
		}
	}
	return nil
}

func (repo *creative) GetByID(ctx context.Context, id string) (*domain.Creative, error) {
	result, err := repo.cache.Get(ctx, id)
	if err != nil {
		result, err = repo.db.GetByID(ctx, id)
		if err != nil {
			return nil, err
		}
		err = repo.cache.Set(ctx, id, result)
	}
	return result, nil
}
