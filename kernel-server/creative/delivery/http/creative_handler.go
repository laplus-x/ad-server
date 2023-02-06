package http

import (
	"AdServer/creative/delivery/http/middleware/userid"
	"AdServer/domain"
	"time"

	"github.com/gofiber/fiber/v2"
	"go.uber.org/zap"
)

type CreativeHandler struct {
	usecase domain.CreativeUsecase
	logger  *zap.Logger
}

func NewCreativeHandler(router fiber.Router, logger *zap.Logger, usecase domain.CreativeUsecase) {
	handler := &CreativeHandler{
		usecase: usecase,
		logger:  logger,
	}
	router.Use(userid.New())
	router.Get("/creative/:id", handler.GetByID)
}

// @Summary      Get ad markup
// @Description  Get ad markup by Creative Entity ID
// @Tags         creative
// @Produce      html
// @Param        id   path      string  true  "Creative Entity ID"	default(creative-62cc3645c78b1223777d8329)
// @Success      200  {string}  string	"<html></html>"
// @Router       /api/creative/{id} [get]
func (handler *CreativeHandler) GetByID(c *fiber.Ctx) error {
	baseURL := c.BaseURL()
	id := c.Params("id")
	requestID := c.Locals("requestid").(string)
	userID := c.Cookies("userid")

	ctx := c.Context()

	data := &domain.Event{
		UserID:      userID,
		RequestID:   requestID,
		RequestTime: time.Now().UTC(),
		EventMap: map[domain.EventType]bool{
			domain.EventTypeReq: true,
		},
	}
	result, err := handler.usecase.GetByID(ctx, id, data)
	if err != nil {
		handler.logger.Error("❌ get ad markup", zap.String("id", id), zap.String("requestID", requestID), zap.String("userID", userID), zap.Error(err))
		return c.SendStatus(fiber.StatusNotFound)
	}

	return c.Render(string(result.Type), fiber.Map{
		"BaseURL":   baseURL,
		"RequestID": requestID,
		"UserID":    userID,
		"Creative":  result,
	})
}
