package usecase_test

import (
	usecase "AdServer/creative/usecase"
	"AdServer/domain"
	"AdServer/domain/mocks"
	"errors"

	"context"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestGetByID(t *testing.T) {
	timeout := 2 * time.Second
	mockCR := new(mocks.CreativeRepository)
	mockER := new(mocks.EventRepository)
	mockCreative := &domain.Creative{
		Name: "test",
		Type: domain.CreativeTypeBanner,
	}
	mockEvent := domain.Event{}

	t.Run("success", func(t *testing.T) {
		mockCR.On("GetByID", mock.Anything, mock.AnythingOfType("string")).Return(mockCreative, nil).Once()

		u := usecase.NewCreativeUsecase(mockCR, mockER, timeout)
		id := "creative-62cc3645c78b1223777d8329"
		res, err := u.GetByID(context.TODO(), id, mockEvent)
		assert.NoError(t, err)
		assert.NotEmpty(t, res)

		mockCR.AssertExpectations(t)
		mockER.AssertExpectations(t)
	})

	t.Run("failed", func(t *testing.T) {
		mockCR.On("GetByID", mock.Anything, mock.AnythingOfType("string")).Return(nil, errors.New("Unexpexted Error")).Once()

		u := usecase.NewCreativeUsecase(mockCR, mockER, timeout)
		id := "creative-62cc3645c78b1223777d8329"
		res, err := u.GetByID(context.TODO(), id, mockEvent)
		assert.Error(t, err)
		assert.Empty(t, res)

		mockCR.AssertExpectations(t)
		mockER.AssertExpectations(t)
	})
}
