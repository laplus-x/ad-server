package mocks

import (
	"AdServer/domain"

	"context"

	"github.com/stretchr/testify/mock"
)

type CreativeRepository struct {
	mock.Mock
}

func (m *CreativeRepository) Sync(ctx context.Context) error {
	args := m.Called(ctx)

	var r0 error
	if rf, ok := args.Get(0).(func(context.Context) error); ok {
		r0 = rf(ctx)
	} else {
		r0 = args.Error(0)
	}

	return r0
}

func (m *CreativeRepository) GetByID(ctx context.Context, id string) (*domain.Creative, error) {
	args := m.Called(ctx, id)

	var r0 *domain.Creative
	if rf, ok := args.Get(0).(func(context.Context, string) *domain.Creative); ok {
		r0 = rf(ctx, id)
	} else {
		if args.Get(0) != nil {
			r0 = args.Get(0).(*domain.Creative)
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
