// ─────────────────────────────────────────────
// SAG RATES
// ─────────────────────────────────────────────
export const SAG_RATES = {
  none:           { label: 'No SAG',              rate: 0    },
  digital:        { label: 'Digital SAG',          rate: 0.20 },
  linear:         { label: 'Linear SAG',           rate: 0.50 },
  linear_digital: { label: 'Linear + Digital SAG', rate: 0.34 },
}

// ─────────────────────────────────────────────
// PACKAGE TYPES
// ─────────────────────────────────────────────
export const PACKAGE_TYPES = {
  influencer:       { label: 'Influencer',              mvp: true  },
  brandedContent:   { label: 'Branded Content',         mvp: true  },
  blendedSocial:    { label: 'Blended Social',          mvp: true  },
  talentProduction: { label: 'Talent & Production Only', mvp: false },
  paidDistribution: { label: 'Paid Distribution Only',  mvp: false },
  streaming:        { label: 'Paramount Streaming',     mvp: false },
  fees:             { label: 'Fees',                    mvp: false },
  linear:           { label: 'Linear',                  mvp: false },
  socialSponsorship:{ label: 'Social Sponsorship',      mvp: false },
  sponsorship:      { label: 'Sponsorship',             mvp: false },
  addedValue:       { label: 'Added Value',             mvp: false },
}

// ─────────────────────────────────────────────
// CAMPAIGN TYPES
// ─────────────────────────────────────────────
export const INFLUENCER_CAMPAIGN_TYPES = [
  { value: 'talentCaptured',    label: 'Talent Captured'    },
  { value: 'hybrid',            label: 'Hybrid'             },
  { value: 'paramountProduced', label: 'Paramount Produced' },
]

export const BRANDED_CONTENT_CAMPAIGN_TYPES = [
  { value: 'ytAndParamountSocial',        label: 'YT and Paramount Social'               },
  { value: 'ytAndParamountTalentSocial',  label: 'YT and Paramount + Talent Social'      },
  { value: 'socialParamountOnly',         label: 'Social Paramount Only (no YT)'         },
  { value: 'socialParamountAndTalent',    label: 'Social Paramount and Talent (no YT)'   },
]

export const BLENDED_CAMPAIGN_TYPES = [
  { value: 'paramountSocialOnly', label: 'Paramount Social Only' },
]

// ─────────────────────────────────────────────
// PRODUCTION PRESENTATION
// ─────────────────────────────────────────────
export const PRESENTATION_TYPES = [
  { value: 'brokenOut', label: 'Broken Out — separate flat fee + media lines' },
  { value: 'blended',   label: 'Blended — P&T combined with media placement'  },
]

// ─────────────────────────────────────────────
// PLATFORMS
// ─────────────────────────────────────────────
export const HANDLES = [
  { value: 'influencer', label: 'Influencer' },
  { value: 'paramount',  label: 'Paramount'  },
]

export const PLATFORMS = [
  { value: 'instagram',       label: 'Instagram'         },
  { value: 'tiktok',          label: 'TikTok'            },
  { value: 'facebook',        label: 'Facebook'          },
  { value: 'facebookInstagram',label: 'Facebook / Instagram' },
  { value: 'x',               label: 'X'                 },
  { value: 'youtubeshorts',   label: 'YouTube Shorts'    },
  { value: 'youtubetrueview', label: 'YouTube Trueview'  },
  { value: 'snap',            label: 'Snap'              },
  { value: 'linkedin',        label: 'LinkedIn'          },
  { value: 'tbd',             label: 'TBD'               },
]

// ─────────────────────────────────────────────
// COST LINE TYPES (Budget Workbench)
// ─────────────────────────────────────────────
export const COST_LINE_TYPES = [
  { value: 'talent',              label: 'Talent',                  hasSAG: true,  defaultCost: 0,    defaultQty: 1 },
  { value: 'videoPhotoShoot',     label: 'Video / Photo Shoot',     hasSAG: false, defaultCost: 0,    defaultQty: 1 },
  { value: 'travel',              label: 'Travel',                  hasSAG: false, defaultCost: 0,    defaultQty: 1 },
  { value: 'marketingInnovation', label: 'Marketing Innovation',    hasSAG: false, defaultCost: 0,    defaultQty: 1 },
  { value: 'glam',                label: 'Glam',                    hasSAG: false, defaultCost: 0,    defaultQty: 1 },
  { value: 'welfareWorker',       label: 'Welfare Worker',          hasSAG: false, defaultCost: 1000, defaultQty: 1 },
  { value: 'misc',                label: 'Misc.',                   hasSAG: false, defaultCost: 0,    defaultQty: 1 },
  { value: 'other',               label: 'Other (custom label)',    hasSAG: false, defaultCost: 0,    defaultQty: 1 },
]

// ─────────────────────────────────────────────
// DEFAULTS
// ─────────────────────────────────────────────
export const DEFAULTS = {
  influencerMarkup:     0.25,
  brandedContentMarkup: 0.25,
  blendedMargin:        0.35,
  blendedMedia:         0.24,
}

// ─────────────────────────────────────────────
// MEDIA % REFERENCE TABLES
// ─────────────────────────────────────────────

export const MEDIA_PCT_TABLES = {

  influence: [
    {
      campaignType: 'Talent Captured',
      rows: [
        { cpm: 14.00, mediaPct: 0.6250, youtubePct: 0, paramountPct: 0, influencerPct: 1 },
        { cpm: 15.00, mediaPct: 0.5833, youtubePct: 0, paramountPct: 0, influencerPct: 1 },
        { cpm: 17.50, mediaPct: 0.5000, youtubePct: 0, paramountPct: 0, influencerPct: 1 },
        { cpm: 19.00, mediaPct: 0.4605, youtubePct: 0, paramountPct: 0, influencerPct: 1 },
      ],
    },
    {
      campaignType: 'Hybrid',
      rows: [
        { cpm: 20.00, mediaPct: 0.4375, youtubePct: 0, paramountPct: 0, influencerPct: 1 },
        { cpm: 22.50, mediaPct: 0.3889, youtubePct: 0, paramountPct: 0, influencerPct: 1 },
        { cpm: 24.00, mediaPct: 0.3646, youtubePct: 0, paramountPct: 0, influencerPct: 1 },
      ],
    },
    {
      campaignType: 'Paramount Produced',
      rows: [
        { cpm: 25.00, mediaPct: 0.3500, youtubePct: 0, paramountPct: 0, influencerPct: 1 },
        { cpm: 30.00, mediaPct: 0.2917, youtubePct: 0, paramountPct: 0, influencerPct: 1 },
        { cpm: 35.00, mediaPct: 0.2500, youtubePct: 0, paramountPct: 0, influencerPct: 1 },
      ],
    },
  ],

  brandedContent: [
    {
      campaignType: 'YT and Paramount Social',
      rows: [
        { cpm: 25.00, mediaPct: 0.6419, youtubePct: 0.50, paramountPct: 0,    influencerPct: 0.50 },
        { cpm: 30.00, mediaPct: 0.5348, youtubePct: 0.50, paramountPct: 0,    influencerPct: 0.50 },
        { cpm: 35.00, mediaPct: 0.4585, youtubePct: 0.50, paramountPct: 0,    influencerPct: 0.50 },
      ],
    },
    {
      campaignType: 'YT and Paramount + Talent Social',
      rows: [
        { cpm: 25.00, mediaPct: 0.5389, youtubePct: 0.50, paramountPct: 0.25, influencerPct: 0.25 },
        { cpm: 30.00, mediaPct: 0.4491, youtubePct: 0.50, paramountPct: 0.25, influencerPct: 0.25 },
        { cpm: 35.00, mediaPct: 0.3849, youtubePct: 0.50, paramountPct: 0.25, influencerPct: 0.25 },
      ],
    },
    {
      campaignType: 'Social Paramount Only (no YT)',
      rows: [
        { cpm: 25.00, mediaPct: 0.6000, youtubePct: 0,    paramountPct: 1,    influencerPct: 0 },
        { cpm: 30.00, mediaPct: 0.5000, youtubePct: 0,    paramountPct: 1,    influencerPct: 0 },
        { cpm: 35.00, mediaPct: 0.4285, youtubePct: 0,    paramountPct: 1,    influencerPct: 0 },
      ],
    },
    {
      campaignType: 'Social Paramount and Talent (no YT)',
      rows: [
        { cpm: 25.00, mediaPct: 0.4421, youtubePct: 0,    paramountPct: 0.50, influencerPct: 0.50 },
        { cpm: 30.00, mediaPct: 0.3684, youtubePct: 0,    paramountPct: 0.50, influencerPct: 0.50 },
        { cpm: 35.00, mediaPct: 0.3158, youtubePct: 0,    paramountPct: 0.50, influencerPct: 0.50 },
      ],
    },
  ],

  blendedSocial: [
    {
      campaignType: 'Paramount Social Only',
      rows: [
        { cpm: 22.50, mediaPct: 0.2667, youtubePct: 0, paramountPct: 1, influencerPct: 0 },
        { cpm: 25.00, mediaPct: 0.2400, youtubePct: 0, paramountPct: 1, influencerPct: 0 },
        { cpm: 30.00, mediaPct: 0.2000, youtubePct: 0, paramountPct: 1, influencerPct: 0 },
        { cpm: 35.00, mediaPct: 0.1714, youtubePct: 0, paramountPct: 1, influencerPct: 0 },
      ],
    },
  ],
}