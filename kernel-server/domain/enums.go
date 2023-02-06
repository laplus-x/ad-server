package domain

const (
	KeyPrefixAdServer = "adserver:"
	IDPrefixCreative  = "creative-"
)

type CreativeType string

const (
	CreativeTypeBanner   CreativeType = "banner"
	CreativeTypePushdown CreativeType = "pushdown"
)

type EventType string

const (
	EventTypeReq EventType = "request"
	EventTypeImp EventType = "impression"
	EventTypeClk EventType = "click"
)

type ReportType string

const (
	ReportTypeCreative ReportType = "creative"
)
