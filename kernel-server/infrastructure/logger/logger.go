package logger

import (
	"log"
	"os"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"gopkg.in/natefinch/lumberjack.v2"
)

func New() *zap.Logger {
	hook := lumberjack.Logger{
		Filename:   "./logs/log",
		MaxSize:    10,
		MaxBackups: 30,
		MaxAge:     7,
		Compress:   false,
	}
	consoleEncoder := zapcore.NewConsoleEncoder(zap.NewDevelopmentEncoderConfig())
	core := zapcore.NewTee(
		zapcore.NewCore(consoleEncoder, zapcore.Lock(os.Stdout), zap.DebugLevel),
		zapcore.NewCore(consoleEncoder, zapcore.AddSync(&hook), zap.DebugLevel),
	)

	return zap.New(core, zap.AddCaller())
}

func Close(logger *zap.Logger) {
	if err := logger.Sync(); err != nil {
		log.Println(err)
	}
}
