package repository

import (
	"AdServer/domain"

	"context"
)

type report struct {
}

func NewReportRepository() *report {
	return &report{}
}

func (repo *report) Read(ctx context.Context, typ domain.ReportType) ([]domain.Report, error) {
	return nil, nil
}

func (repo *report) Write(ctx context.Context, data domain.Report) error {
	return nil
}
