package usecase

import (
	"AdServer/domain"
	"context"

	"time"
)

type event struct {
	er      domain.EventRepository
	rr      domain.ReportRepository
	timeout time.Duration
}

func NewEventUsecase(er domain.EventRepository, rr domain.ReportRepository, timeout time.Duration) *event {
	return &event{
		er:      er,
		rr:      rr,
		timeout: timeout,
	}
}

func (usecase *event) UpdateByID(c context.Context, id, asset string, event domain.EventType) error {
	ctx, cancel := context.WithTimeout(c, usecase.timeout)
	defer cancel()

	id = domain.KeyPrefixAdServer + id

	locker, err := usecase.er.Lock(id)
	if err != nil {
		return err
	}
	defer locker.Unlock()

	data, err := usecase.er.Get(ctx, id)
	if err != nil {
		return err
	}
	if _, ok := data.EventMap[event]; !ok {
		data.EventMap[event] = true
	}
	return usecase.er.Set(ctx, id, data)
}
