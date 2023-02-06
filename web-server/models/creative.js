const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const timestamps = require("mongoose-timestamp");
const {
  MATERIAL_TYPE,
  TEMPERATURE_TYPE,
  ENUM_CREATIVE_DISCRIMINATOR_KEY,
  DISCRIMINATOR_MODEL_NAME,
} = require("./constant");

var options = { collection: "Creative", discriminatorKey: "_type" };
var CreativeSchemaObj = {
  creator: { type: Schema.Types.ObjectId, ref: "Creator", required: true },
  creative_id: { type: String, unique: true, required: true },
  folder: {
    type: Schema.Types.ObjectId,
    ref: "CreativeFolder",
  },
  name: { type: String, required: true },
  is_archived: { type: Boolean, default: false },
  material_type: { type: Number, required: true, default: MATERIAL_TYPE.IMAGE },
  landing_page: { type: String },
  click_trackings: [String],
  impression_trackings: [String],
  preview_type: { type: Number },
  preview_device: { type: Number },
  // for report
  advertiser: { type: Schema.Types.ObjectId, ref: "Advertiser" },
  campaign: { type: Schema.Types.ObjectId, ref: "Campaign" },
};

const CreativeSchema = Schema(CreativeSchemaObj, options);
CreativeSchema.plugin(timestamps, {
  createdAt: "created_at",
  updatedAt: "updated_at",
});

const CreativeSchemaExt = {
  Inskin: {
    top_image_url: { type: String, required: true },
    top_image_height: { type: Number, required: true },

    left_image_url: { type: String, required: true },

    right_image_url: { type: String, required: true },

    bottom_image_url: { type: String, required: true },
    bottom_image_height: { type: Number, required: true },

    content_width: { type: Number, default: 80 }, // 60-80, content width percentage
  },
  Outstream: {
    is_custom: { type: Boolean, required: true, default: false }, // for vast_xml
    vast_url: { type: String },
    vast_xml: { type: String, required: true },
    youtube_video_id: { type: String },
  },
  Pushdown: {
    initial_image_url: {
      type: String,
      required: function () {
        return this.material_type === MATERIAL_TYPE.IMAGE;
      },
    },
    expanded_image_url: {
      type: String,
      required: function () {
        return this.material_type === MATERIAL_TYPE.IMAGE;
      },
    },
    initial_html_url: {
      type: String,
      required: function () {
        return this.material_type === MATERIAL_TYPE.HTML;
      },
    },
    expanded_html_url: {
      type: String,
      required: function () {
        return this.material_type === MATERIAL_TYPE.HTML;
      },
    },
    millisecond: {
      type: Number,
    },
    times: {
      type: Number,
    },
  },
  PushdownWithOutstream: {
    initial_image_url: {
      type: String,
      required: function () {
        return this.material_type === MATERIAL_TYPE.IMAGE;
      },
    },
    expanded_image_url: {
      type: String,
      required: function () {
        return this.material_type === MATERIAL_TYPE.IMAGE;
      },
    },
    initial_html_url: {
      type: String,
      required: function () {
        return this.material_type === MATERIAL_TYPE.HTML;
      },
    },
    expanded_html_url: {
      type: String,
      required: function () {
        return this.material_type === MATERIAL_TYPE.HTML;
      },
    },
    is_custom: { type: Boolean, required: true, default: false }, // for vast_xml
    vast_url: { type: String },
    vast_xml: { type: String },
    youtube_video_id: { type: String },
    initial_video_width: { type: Number, required: true },
    initial_video_height: { type: Number, required: true },

    expanded_video_width: { type: Number, required: true },
    expanded_video_height: { type: Number, required: true },

    initial_vertical_align: { type: String, default: "center", required: true }, // top, center, bottom
    initial_horizontal_align: {
      type: String,
      default: "center",
      required: true,
    }, // left, center, right
    initial_vertical_padding: { type: Number },
    initial_horizontal_padding: { type: Number },

    expanded_vertical_align: {
      type: String,
      default: "center",
      required: true,
    }, // top, center, bottom
    expanded_horizontal_align: {
      type: String,
      default: "center",
      required: true,
    }, // left, center, right
    expanded_vertical_padding: { type: Number },
    expanded_horizontal_padding: { type: Number },
    millisecond: {
      type: Number,
    },
    times: {
      type: Number,
    },
  },
  ParallaxScrolling: {
    images: [
      {
        _id: false,
        material_type: {
          type: Number,
          default: MATERIAL_TYPE.IMAGE,
          required: true,
        },
        url: String,
        millisecond: {
          type: Number,
        },
        times: {
          type: Number,
        },
      },
    ],
    use_fullscreen: { type: Boolean, required: true, default: false },
  },
  ParallaxScrollingWithOutstream: {
    images: [
      {
        _id: false,
        material_type: {
          type: Number,
          default: MATERIAL_TYPE.IMAGE,
          required: true,
        },
        url: String,
        millisecond: {
          type: Number,
        },
        times: {
          type: Number,
        },
      },
    ],
    use_fullscreen: { type: Boolean, required: true, default: false },

    video_index: { type: Number, required: true, default: 0 },
    is_custom: { type: Boolean, required: true, default: false }, // for vast_xml
    vast_url: { type: String },
    vast_xml: { type: String },
    youtube_video_id: { type: String },
    facebook_video_url: { type: String },
    facebook_video_landing_page: { type: String },
    video_width: { type: Number, required: true },
    video_height: { type: Number, required: true },

    vertical_align: { type: String, default: "center", required: true }, // top, center, bottom
    horizontal_align: { type: String, default: "center", required: true }, // left, center, right
    vertical_padding: { type: Number },
    horizontal_padding: { type: Number },
  },
  Banner: {
    image_url: {
      type: String,
      required: function () {
        return this.material_type === MATERIAL_TYPE.IMAGE;
      },
    },
    html_url: {
      type: String,
      required: function () {
        return this.material_type === MATERIAL_TYPE.HTML;
      },
    },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    millisecond: {
      type: Number,
    },
    times: {
      type: Number,
    },
  },
  BannerWithOutstream: {
    image_url: {
      type: String,
      required: function () {
        return this.material_type === MATERIAL_TYPE.IMAGE;
      },
    },
    html_url: {
      type: String,
      required: function () {
        return this.material_type === MATERIAL_TYPE.HTML;
      },
    },
    width: { type: Number, required: true },
    height: { type: Number, required: true },

    is_custom: { type: Boolean, required: true, default: false }, // for vast_xml
    vast_url: { type: String },
    vast_xml: { type: String },
    youtube_video_id: { type: String },
    facebook_video_url: { type: String },
    facebook_video_landing_page: { type: String },
    video_width: { type: Number, required: true },
    video_height: { type: Number, required: true },

    vertical_align: { type: String, default: "center", required: true }, // top, center, bottom
    horizontal_align: { type: String, default: "center", required: true }, // left, center, right
    vertical_padding: { type: Number },
    horizontal_padding: { type: Number },
    millisecond: {
      type: Number,
    },
    times: {
      type: Number,
    },
  },
  PostAd: {
    image_url: {
      type: String,
      required: true,
    },
    advertiser_icon: {
      type: String,
      required: true,
    },
    advertiser_name: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  PostAdWithOutstream: {
    advertiser_icon: {
      type: String,
      required: true,
    },
    advertiser_name: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    vast_url: { type: String },
    vast_xml: { type: String },
    is_custom: { type: Boolean, required: true, default: false }, // for vast_xml
  },
  ScrollingBox: {
    scrolling_boxes: [
      {
        _id: false,
        image_url: String,
        landing_page: String,
      },
    ],
    offset_bottom_unit: {
      type: String,
    },
    offset_bottom_number: {
      type: Number,
    },
  },
  Carousel: {
    carousels: [
      {
        _id: false,
        image_url: String,
        landing_page: String,
      },
    ],
  },
  Spinner: {
    top: {
      landing_page: { type: String, required: true },
      click_tracking: { type: String },
      images: [
        {
          _id: false,
          url: String,
          use_shake_center: { type: Boolean, default: false },
          shake_center: {
            x: Number,
            y: Number,
          },
        },
      ],
    },
    left: {
      landing_page: { type: String, required: true },
      click_tracking: { type: String },
      images: [
        {
          _id: false,
          url: String,
          use_shake_center: { type: Boolean, default: false },
          shake_center: {
            x: Number,
            y: Number,
          },
        },
      ],
    },
    right: {
      landing_page: { type: String, required: true },
      click_tracking: { type: String },
      images: [
        {
          _id: false,
          url: String,
          use_shake_center: { type: Boolean, default: false },
          shake_center: {
            x: Number,
            y: Number,
          },
        },
      ],
    },
    bottom: {
      landing_page: { type: String, required: true },
      click_tracking: { type: String },
      images: [
        {
          _id: false,
          url: String,
          use_shake_center: { type: Boolean, default: false },
          shake_center: {
            x: Number,
            y: Number,
          },
        },
      ],
    },
    offset_bottom_unit: {
      type: String,
    },
    offset_bottom_number: {
      type: Number,
    },
  },
  Cards: {
    cards: [
      {
        _id: false,
        image_url: String,
        landing_page: String,
      },
    ],
    offset_bottom_unit: {
      type: String,
    },
    offset_bottom_number: {
      type: Number,
    },
  },
  RollingCastle: {
    background_image_url: { type: String, required: true },
    cards: [
      {
        _id: false,
        image_url: String,
      },
    ],
    banners: [
      {
        _id: false,
        type: { type: String }, // image, video
        landing_page: String,

        // for image type
        images: [
          {
            _id: false,
            type: { type: String }, // bg, fg
            url: String,
            // for fg type
            width: Number,
            is_float: { type: Boolean, default: false },
            vertical_align: { type: String, default: "center" }, // top, center, bottom
            horizontal_align: { type: String, default: "center" }, // left, center, right
            vertical_padding: Number,
            horizontal_padding: Number,
          },
        ],

        // for video type
        is_custom: { type: Boolean, default: false }, // for vast_xml
        vast_url: String,
        vast_xml: String,
        youtube_video_id: String,
      },
    ],
    offset_bottom_unit: {
      type: String,
    },
    offset_bottom_number: {
      type: Number,
    },
  },
  Switch: {
    blinds: [
      {
        _id: false,
        image_url: String,
        landing_page: String,
      },
    ],
  },
  Marquee: {
    images: [
      {
        _id: false,
        url: String,
      },
    ],
    offset_bottom_unit: {
      type: String,
    },
    offset_bottom_number: {
      type: Number,
    },
  },
  Swap: {
    swap: [
      {
        _id: false,
        image_url: String,
        landing_page: String,
      },
    ],
  },
  CountDown: {
    date_time: {
      type: Date,
      required: true,
    },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    top_layer_image_url: {
      type: String,
      required: true,
    },
    ultimate_image_url: {
      type: String,
      required: true,
    },
    ultimate_landing_page: {
      type: String,
      required: true,
    },
    images: [
      {
        _id: false,
        image_url: String,
      },
    ],
  },
  Vast: {
    vast_url: { type: String },
    vast_xml: { type: String, required: true },
  },
  DataDriven: {
    width: {
      type: Number,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
    conditions: [
      {
        _id: false,
        name: {
          type: String,
          required: true,
        },
        landing_page: {
          type: String,
          required: true,
        },
        image_url: {
          type: String,
          required: function () {
            return this.material_type === MATERIAL_TYPE.IMAGE;
          },
        },
        html_url: {
          type: String,
          required: function () {
            return this.material_type === MATERIAL_TYPE.HTML;
          },
        },
        time_duration: [Date, Date],
        time_duration_display: {
          type: Boolean,
          required: true,
        },
        weather: String,
        weather_display: {
          type: Boolean,
          required: true,
        },
        humidity_min: Number,
        humidity_max: Number,
        humidity_display: {
          type: Boolean,
          required: true,
        },
        temperature_min: Number,
        temperature_max: Number,
        temperature_display: { type: Boolean, required: true },
        temperature_unit: { type: Number, default: TEMPERATURE_TYPE.C },
        pm25_min: Number,
        pm25_max: Number,
        pm25_display: { type: Boolean, required: true },
        vertical_align: { type: String, default: "center", required: true }, // top, center, bottom
        horizontal_align: { type: String, default: "center", required: true }, // left, center, right
        vertical_padding: { type: Number },
        horizontal_padding: { type: Number },
      },
    ],
  },
  ProductAd: {
    advertiser_icon: {
      type: String,
      required: true,
    },
    content_text: {
      type: String,
      required: true,
    },
    advertiser_name: {
      type: String,
      required: true,
    },
    cards: [
      {
        _id: false,
        width: { type: Number, required: true },
        height: { type: Number, required: true },
        image_url: { type: String, required: true },
        landing_page: { type: String, required: true },
        description: { type: String, required: true },
      },
    ],
  },
};

var Creative = mongoose.model("Creative", CreativeSchema);

for (const key of Object.keys(ENUM_CREATIVE_DISCRIMINATOR_KEY)) {
  const DiscriminatorSchemaObj = Object.assign(
    {},
    CreativeSchemaObj,
    eval("CreativeSchemaExt." + DISCRIMINATOR_MODEL_NAME.CREATIVE[key])
  );

  exports[DISCRIMINATOR_MODEL_NAME.CREATIVE[key]] = Creative.discriminator(
    ENUM_CREATIVE_DISCRIMINATOR_KEY[key],
    new Schema(DiscriminatorSchemaObj, options)
  );
}

exports.Creative = Creative
