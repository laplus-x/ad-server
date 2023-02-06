package usecase

import (
	"AdServer/domain"
	"time"

	"context"
)

type report struct {
	rr      domain.ReportRepository
	timeout time.Duration
}

func NewReportUsecase(rr domain.ReportRepository, timeout time.Duration) *report {
	return &report{
		rr:      rr,
		timeout: timeout,
	}
}

func (usecase *report) GetByType(ctx context.Context, typ domain.ReportType) ([]domain.Report, error) {
	return nil, nil
}
