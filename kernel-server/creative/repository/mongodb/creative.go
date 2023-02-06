package mongodb

import (
	"AdServer/domain"
	"time"

	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type CreativeRepository interface {
	Get(ctx context.Context) ([]domain.Creative, error)
	GetByID(ctx context.Context, id string) (*domain.Creative, error)
}

type creative struct {
	collection *mongo.Collection
}

func NewCreativeRepository(db *mongo.Database) *creative {
	collection := db.Collection("Creative")
	return &creative{collection: collection}
}

func (repo *creative) Get(ctx context.Context) ([]domain.Creative, error) {
	now := time.Now().UTC()
	stages := []bson.M{
		{
			"$match": bson.M{
				"is_archive": false,
			},
		},
		{
			"$lookup": bson.M{
				"localField":   "campaign_id",
				"from":         "Campaign",
				"foreignField": "_id",
				"as":           "campaign",
			},
		},
		{
			"$match": bson.M{
				"campaign.is_archive": false,
				"campaign.start_date": bson.M{"$lte": now},
				"campaign.end_date":   bson.M{"$gte": now},
			},
		},
		{
			"$addFields": bson.M{
				"agency_id": bson.M{
					"$arrayElemAt": []interface{}{"$campaign.agency_id", 0},
				},
				"tracking_map": bson.M{
					"$arrayToObject": bson.M{
						"$map": bson.M{
							"input": "$trackings",
							"in": bson.M{
								"k": bson.M{
									"$concat": []string{
										"$$this.event",
										"-",
										"$$this.id",
									},
								},
								"v": "$$this.uris",
							},
						},
					},
				},
			},
		},
	}

	cursor, err := repo.collection.Aggregate(ctx, stages)
	if err != nil {
		return nil, err
	}

	var result []domain.Creative
	if err = cursor.All(ctx, &result); err != nil {
		return nil, err
	}
	return result, nil
}

func (repo *creative) GetByID(ctx context.Context, id string) (*domain.Creative, error) {
	stages := []bson.M{
		{
			"$match": bson.M{
				"entity_id":  id,
				"is_archive": false,
			},
		},
		{
			"$lookup": bson.M{
				"localField":   "campaign_id",
				"from":         "Campaign",
				"foreignField": "_id",
				"as":           "campaign",
			},
		},
		{
			"$addFields": bson.M{
				"agency_id": bson.M{
					"$arrayElemAt": []interface{}{"$campaign.agency_id", 0},
				},
				"tracking_map": bson.M{
					"$arrayToObject": bson.M{
						"$map": bson.M{
							"input": "$trackings",
							"in": bson.M{
								"k": bson.M{
									"$concat": []string{
										"$$this.event",
										"-",
										"$$this.id",
									},
								},
								"v": "$$this.uris",
							},
						},
					},
				},
			},
		},
	}
	cursor, err := repo.collection.Aggregate(ctx, stages)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var result []domain.Creative
	if err = cursor.All(ctx, &result); err != nil {
		return nil, err
	} else if len(result) < 1 {
		return nil, mongo.ErrNoDocuments
	}
	return &result[0], nil
}
