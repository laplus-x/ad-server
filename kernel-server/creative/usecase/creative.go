package usecase

import (
	"AdServer/domain"
	"context"

	"time"
)

type creative struct {
	cr      domain.CreativeRepository
	er      domain.EventRepository
	timeout time.Duration
}

func NewCreativeUsecase(cr domain.CreativeRepository, er domain.EventRepository, timeout time.Duration) *creative {
	return &creative{
		cr:      cr,
		er:      er,
		timeout: timeout,
	}
}

func (usecase *creative) GetByID(c context.Context, id string, data *domain.Event) (*domain.Creative, error) {
	ctx, cancel := context.WithTimeout(c, usecase.timeout)
	defer cancel()

	result, err := usecase.cr.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	data.Creative = domain.Creative{
		PK:         result.PK,
		CampaignPK: result.CampaignPK,
		AgencyPK:   result.AgencyPK,

		TrackingMap: result.TrackingMap,
	}
	if err := usecase.er.Set(ctx, domain.KeyPrefixAdServer+data.RequestID, data); err != nil {
		return nil, err
	}
	return result, nil
}
