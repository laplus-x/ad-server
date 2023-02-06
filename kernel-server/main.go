package main

import (
	_creativeHttpDelivery "AdServer/creative/delivery/http"
	_creativeRepository "AdServer/creative/repository"
	_creativeUsecase "AdServer/creative/usecase"
	_eventHttpDelivery "AdServer/event/delivery/http"
	_eventRepository "AdServer/event/repository/redis"
	_eventUsecase "AdServer/event/usecase"
	_reportHttpDelivery "AdServer/report/delivery/http"
	_reportRepository "AdServer/report/repository"
	_reportUsecase "AdServer/report/usecase"

	_ "AdServer/docs"
	_cache "AdServer/infrastructure/cache"
	_config "AdServer/infrastructure/config"
	_logger "AdServer/infrastructure/logger"
	_mongodb "AdServer/infrastructure/mongodb"
	_redis "AdServer/infrastructure/redis"

	"context"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-co-op/gocron"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/pprof"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/gofiber/fiber/v2/middleware/requestid"
	"github.com/gofiber/swagger"
	"github.com/gofiber/template/html"
	"go.uber.org/zap"
	"go.uber.org/zap/zapio"
	"golang.org/x/sync/errgroup"
)

// @title AdServer Example
// @version 1.0
// @description This is a sample ad server

// @host localhost:3000
// @BasePath /
func main() {
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGHUP, syscall.SIGINT, syscall.SIGTERM, syscall.SIGQUIT, syscall.SIGUSR1, syscall.SIGUSR2, syscall.SIGILL, syscall.SIGFPE)
	defer stop()

	// logger
	log := _logger.New()
	defer _logger.Close(log)

	// config
	cfg, err := _config.New()
	if err != nil {
		log.Panic("❌ load config", zap.Error(err))
	}

	// database
	cache, err := _cache.New(15 * time.Minute)
	if err != nil {
		log.Panic("❌ create cache", zap.Error(err))
	}
	defer _cache.Close(cache)

	mongoClient, err := _mongodb.NewClient(ctx, cfg.MongoDB)
	if err != nil {
		log.Panic("❌ connect mongodb", zap.Error(err))
	}
	defer _mongodb.Close(mongoClient)

	mongoDB := mongoClient.Database(cfg.MongoDB.DBName)
	cr := _creativeRepository.NewCreativeRepository(mongoDB, cache)

	redis, err := _redis.New(ctx, cfg.Redis)
	if err != nil {
		log.Panic("❌ connect redis", zap.Error(err))
	}
	defer _redis.Close(redis)

	er := _eventRepository.NewEventRepository(redis, time.Hour)

	// set kafka client
	rr := _reportRepository.NewReportRepository()

	// cronjob
	s := gocron.NewScheduler(time.UTC)
	s.Every(1).Minute().StartImmediately().Do(cr.Sync, ctx)
	s.StartAsync()
	defer s.Stop()

	engine := html.New("./infrastructure/web", ".js")
	engine.Debug(cfg.Server.Debug)
	engine.Reload(cfg.Server.Debug)

	// server
	app := fiber.New(fiber.Config{
		Views:        engine,
		ReadTimeout:  time.Duration(cfg.Server.ReadTimeout) * time.Second,
		WriteTimeout: time.Duration(cfg.Server.WriteTimeout) * time.Second,
	})
	app.Use(recover.New())
	app.Use(cors.New(cors.Config{
		AllowMethods:     "GET",
		AllowCredentials: true,
	}))
	app.Use(requestid.New())

	if cfg.Server.Debug {
		writer := &zapio.Writer{Log: log, Level: zap.DebugLevel}
		defer writer.Close()

		app.Use(logger.New(logger.Config{
			Output: writer,
		}))
		app.Use(pprof.New())
		app.Get("/swagger/*", swagger.HandlerDefault)
	}

	// component
	api := app.Group("/api")
	timeout := time.Duration(cfg.Server.RequestTimeout) * time.Second
	cu := _creativeUsecase.NewCreativeUsecase(cr, er, timeout)
	_creativeHttpDelivery.NewCreativeHandler(api, log, cu)

	eu := _eventUsecase.NewEventUsecase(er, rr, timeout)
	_eventHttpDelivery.NewEventHandler(api, log, eu)

	ru := _reportUsecase.NewReportUsecase(rr, timeout)
	_reportHttpDelivery.NewReportHandler(api, log, ru)

	g, gctx := errgroup.WithContext(ctx)

	g.Go(func() error {
		log.Info("Start server listening on port", zap.String("port", cfg.Server.Port))
		return app.Listen(":" + cfg.Server.Port)
	})
	g.Go(func() error {
		<-gctx.Done()
		return app.Shutdown()
	})

	if err := g.Wait(); err == context.Canceled || err == nil {
		log.Info("✔️ quit server")
	} else if err != nil {
		log.Error("❌ quit server", zap.Error(err))
	}
}
