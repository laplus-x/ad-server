package http

import (
	"AdServer/domain"

	"github.com/gofiber/fiber/v2"
	"go.uber.org/zap"
)

type Request struct {
	Metrics []string
}

type Response struct {
	Data []domain.Report `json:"data"`
}

type ReportHandler struct {
	usecase domain.ReportUsecase
	logger  *zap.Logger
}

func NewReportHandler(router fiber.Router, logger *zap.Logger, usecase domain.ReportUsecase) {
	handler := &ReportHandler{
		usecase: usecase,
		logger:  logger,
	}
	router.Post("/report/:type", handler.GetByType)
}

// @Summary      Get Report
// @Description  Get report by type
// @Tags         report
// @Produce      json
// @Param        type   path      string  true  "Report Type"	Enums(creative)	default("creative")
// @Success      200  	{object}  domain.Response
// @Router       /api/report/{type} [post]
func (handler *ReportHandler) GetByType(c *fiber.Ctx) error {
	typ := c.Params("type")

	query := new(Request)
	if err := c.BodyParser(query); err != nil {
		return err
	}

	ctx := c.Context()

	result, err := handler.usecase.GetByType(ctx, domain.ReportType(typ))
	if err != nil {
		handler.logger.Error("❌ get report", zap.Error(err))
		return c.SendStatus(fiber.StatusNotFound)
	}

	return c.JSON(Response{
		Data: result,
	})
}
