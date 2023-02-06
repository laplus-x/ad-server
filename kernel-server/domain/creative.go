package domain

import (
	"context"
	"errors"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Creative struct {
	PK         primitive.ObjectID `bson:"_id"`
	CampaignPK primitive.ObjectID `bson:"campaign_id"` // FK -> Campaign
	AgencyPK   primitive.ObjectID `bson:"agency_id"`   // FK -> Agency

	ID         string       `bson:"entity_id"`
	Name       string       `bson:"name"`
	Type       CreativeType `bson:"_type"`
	Width      int          `bson:"width"`
	Height     int          `bson:"height"`
	IsArchived bool         `bson:"is_archived"`

	TrackingMap map[string][]string `bson:"tracking_map"`

	Detail interface{}
}

type Asset struct {
	ID          string `bson:"id"`
	URI         string `bson:"uri"`
	LandingPage string `bson:"landing_page"`
}

type CreativeBanner struct {
	Image Asset `bson:"image"`
}

type CreativePushdown struct {
	Images []Asset `bson:"images"`
}

func (c *Creative) UnmarshalBSON(b []byte) error {
	var tmp struct {
		Type CreativeType `bson:"_type"`
	}
	if err := bson.Unmarshal(b, &tmp); err != nil {
		return err
	}

	switch tmp.Type {
	case CreativeTypeBanner:
		c.Detail = new(CreativeBanner)
	case CreativeTypePushdown:
		c.Detail = new(CreativePushdown)
	default:
		return errors.New("invalid type")
	}
	if err := bson.Unmarshal(b, c.Detail); err != nil {
		return err
	}

	type alias Creative
	return bson.Unmarshal(b, (*alias)(c))
}

type CreativeUsecase interface {
	GetByID(ctx context.Context, id string, data *Event) (*Creative, error)
}

type CreativeRepository interface {
	Sync(ctx context.Context) error
	GetByID(ctx context.Context, id string) (*Creative, error)
}
