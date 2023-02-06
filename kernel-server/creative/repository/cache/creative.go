package cache

import (
	"AdServer/domain"

	"bytes"
	"context"
	"encoding/gob"

	"github.com/allegro/bigcache/v3"
)

type CreativeRepository interface {
	Get(ctx context.Context, id string) (*domain.Creative, error)
	Set(ctx context.Context, id string, data *domain.Creative) error
}

type Creative struct {
	cache *bigcache.BigCache
}

func init() {
	gob.Register(domain.Creative{})
	gob.Register(domain.Asset{})
	gob.Register(domain.CreativeBanner{})
	gob.Register(domain.CreativePushdown{})
}

func NewCreativeRepository(cache *bigcache.BigCache) *Creative {
	return &Creative{cache: cache}
}

func (repo *Creative) Get(ctx context.Context, id string) (*domain.Creative, error) {
	entry, err := repo.cache.Get(id)
	if err != nil {
		return nil, err
	}

	buf := bytes.NewBuffer(entry)
	dec := gob.NewDecoder(buf)

	var result domain.Creative
	if err := dec.Decode(&result); err != nil {
		return nil, err
	}
	return &result, nil
}

func (repo *Creative) Set(ctx context.Context, id string, data *domain.Creative) error {
	var buf bytes.Buffer
	enc := gob.NewEncoder(&buf)
	if err := enc.Encode(data); err != nil {
		return err
	}
	return repo.cache.Set(id, buf.Bytes())
}
