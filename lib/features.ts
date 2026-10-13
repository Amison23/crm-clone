export const features = {
  telephony: false,
  ivrBuilder: false,
  softphone: false,
  botBuilder: false,
} as const;

export type FeatureFlag = keyof typeof features;
