package domain

import (
	"context"
	"time"
)

type Report struct {
	Date time.Time
}

type ReportUsecase interface {
	GetByType(ctx context.Context, typ ReportType) ([]Report, error)
}

type ReportRepository interface {
	Read(ctx context.Context, typ ReportType) ([]Report, error)
	Write(ctx context.Context, data Report) error
}
