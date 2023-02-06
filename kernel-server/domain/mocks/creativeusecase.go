package mocks

import (
	"AdServer/domain"

	"context"

	"github.com/stretchr/testify/mock"
)

type CreativeUsecase struct {
	mock.Mock
}

func (m *CreativeUsecase) GetByID(ctx context.Context, id string, data domain.Event) (*domain.Creative, error) {
	args := m.Called(ctx, id, data)

	var r0 *domain.Creative
	if rf, ok := args.Get(0).(func(context.Context, string, domain.Event) *domain.Creative); ok {
		r0 = rf(ctx, id, data)
	} else {
		if args.Get(0) != nil {
			r0 = args.Get(0).(*domain.Creative)
		}
	}

	var r1 error
	if rf, ok := args.Get(1).(func(context.Context, string, domain.Event) error); ok {
		r1 = rf(ctx, id, data)
	} else {
		r1 = args.Error(1)
	}

	return r0, r1
}
