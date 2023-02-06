package http

import (
	"AdServer/domain"
	"context"
	"encoding/base64"

	"github.com/gofiber/fiber/v2"
	"go.uber.org/zap"
)

type EventHandler struct {
	usecase domain.EventUsecase
	logger  *zap.Logger
}

func NewEventHandler(router fiber.Router, logger *zap.Logger, usecase domain.EventUsecase) {
	handler := &EventHandler{
		usecase: usecase,
		logger:  logger,
	}
	router.Get("/request/:id/asset/:asset/event/:event", handler.UpdateByID)
}

// @Summary      Track advertising campaigns
// @Description  update event  by Request ID and Event  Type
// @Tags         event
// @Produce      gif
// @Param        id   	path		string  true  "Request ID" 	default(e7c4d013-a8a1-43b4-b5ef-a86ec74d79ec)
// @Param        asset   path		string  true  "Asset ID"	default(img-1)
// @Param        event   path		string  true  "Event Type"	default(impression)
// @Success      200  	{string}  string
// @Router       /api/request/{id}/asset/{asset}/event/{event} [get]
func (handler *EventHandler) UpdateByID(c *fiber.Ctx) error {
	id := c.Params("id")
	asset := c.Params("asset")
	event := c.Params("event")

	go func(id, asset, event string) {
		if err := handler.usecase.UpdateByID(context.Background(), id, asset, domain.EventType(event)); err != nil {
			handler.logger.Error("❌ update event", zap.String("id", id), zap.String("asset", asset), zap.String("event", event), zap.Error(err))
		}
	}(id, asset, event)

	c.Set(fiber.HeaderContentType, "image/gif")
	buf := "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
	output, _ := base64.StdEncoding.DecodeString(buf)
	c.Write(output)
	return nil
}
