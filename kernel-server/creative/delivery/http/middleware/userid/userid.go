package userid

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type Config struct {
	Next func(c *fiber.Ctx) bool

	CookieName string
	MaxAge     time.Duration
}

var ConfigDefault = Config{
	Next:       nil,
	CookieName: "userid",
	MaxAge:     30 * 24 * time.Hour,
}

func New(configs ...Config) fiber.Handler {
	cfg := ConfigDefault

	if len(configs) > 0 {
		cfg = configs[0]

		// Set default values
		if cfg.CookieName == "" {
			cfg.CookieName = ConfigDefault.CookieName
		}
		if cfg.MaxAge == 0 {
			cfg.MaxAge = ConfigDefault.MaxAge
		}
	}
	return func(c *fiber.Ctx) error {
		if cfg.Next != nil && cfg.Next(c) {
			return c.Next()
		}

		if id := c.Cookies(cfg.CookieName); id == "" {
			query_id := c.Query(cfg.CookieName)
			if _, err := uuid.Parse(query_id); err == nil {
				id = query_id
			} else {
				id = uuid.New().String()
			}
			c.Cookie(&fiber.Cookie{
				Name:     cfg.CookieName,
				Value:    id,
				HTTPOnly: true,
				MaxAge:   int(cfg.MaxAge.Seconds()),
				Expires:  time.Now().Add(cfg.MaxAge),
				Secure:   true,
			})
		}
		return c.Next()
	}
}
