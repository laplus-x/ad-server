package redis

import (
	"AdServer/domain"
	"bytes"
	"encoding/gob"
	"time"

	"context"

	lock "github.com/bsm/redis-lock"
	"github.com/go-redis/redis"
)

type event struct {
	client *redis.Client
	TTL    time.Duration
}

func init() {
	gob.Register(domain.Event{})
}

func NewEventRepository(client *redis.Client, eviction time.Duration) *event {
	return &event{
		client: client,
		TTL:    eviction,
	}
}

func (repo *event) Lock(id string) (*lock.Locker, error) {
	return lock.Obtain(repo.client, "LOCK:"+id, &lock.Options{
		LockTimeout: time.Second,
		RetryCount:  10,
		RetryDelay:  100 * time.Millisecond,
	})
}

func (repo *event) Get(ctx context.Context, id string) (*domain.Event, error) {
	entry, err := repo.client.Get(id).Result()
	if err != nil {
		return nil, err
	}

	buf := bytes.NewBufferString(entry)
	dec := gob.NewDecoder(buf)

	var data domain.Event
	if err := dec.Decode(&data); err != nil {
		return nil, err
	}
	return &data, nil
}

func (repo *event) Set(ctx context.Context, id string, data *domain.Event) error {
	var buf bytes.Buffer
	enc := gob.NewEncoder(&buf)
	if err := enc.Encode(data); err != nil {
		return err
	}
	return repo.client.Set(id, buf.String(), repo.TTL).Err()
}
