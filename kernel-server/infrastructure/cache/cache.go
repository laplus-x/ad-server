package cache

import (
	"log"
	"time"

	"github.com/allegro/bigcache/v3"
)

func New(eviction time.Duration) (*bigcache.BigCache, error) {
	config := bigcache.DefaultConfig(eviction)
	return bigcache.NewBigCache(config)
}

func Close(cache *bigcache.BigCache) {
	if err := cache.Close(); err != nil {
		log.Println(err)
	}
}
