package mocks

import (
	"AdServer/domain"

	"context"

	lock "github.com/bsm/redis-lock"
	"github.com/stretchr/testify/mock"
)

type EventRepository struct {
	mock.Mock
}

func (m *EventRepository) Lock(id string) (*lock.Locker, error) {
	args := m.Called(id)

	var r0 *lock.Locker
	if rf, ok := args.Get(0).(func(string) *lock.Locker); ok {
		r0 = rf(id)
	} else {
		if args.Get(0) != nil {
			r0 = args.Get(0).(*lock.Locker)
		}
	}

	var r1 error
	if rf, ok := args.Get(1).(func(string) error); ok {
		r1 = rf(id)
	} else {
		r1 = args.Error(1)
	}

	return r0, r1
}
func (m *EventRepository) Get(ctx context.Context, id string) (*domain.Event, error) {
	args := m.Called(ctx, id)

	var r0 *domain.Event
	if rf, ok := args.Get(0).(func(context.Context, string) *domain.Event); ok {
		r0 = rf(ctx, id)
	} else {
		if args.Get(0) != nil {
			r0 = args.Get(0).(*domain.Event)
		}
	}

	var r1 error
	if rf, ok := args.Get(1).(func(context.Context, string) error); ok {
		r1 = rf(ctx, id)
	} else {
		r1 = args.Error(1)
	}

	return r0, r1
}
func (m *EventRepository) Set(ctx context.Context, id string, data *domain.Event) error {
	args := m.Called(ctx, id, data)

	var r0 error
	if rf, ok := args.Get(0).(func(context.Context, string, *domain.Event) error); ok {
		r0 = rf(ctx, id, data)
	} else {
		r0 = args.Error(0)
	}

	return r0
}
