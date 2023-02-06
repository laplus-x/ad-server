package domain

import (
	"context"
	"time"

	lock "github.com/bsm/redis-lock"
)

type Event struct {
	UserID      string
	RequestID   string
	RequestTime time.Time
	Creative    Creative

	// metrics
	EventMap map[EventType]bool
}

type EventUsecase interface {
	UpdateByID(ctx context.Context, id, asset string, event EventType) error
}

type EventRepository interface {
	Lock(id string) (*lock.Locker, error)
	Get(ctx context.Context, id string) (*Event, error)
	Set(ctx context.Context, id string, data *Event) error
}
