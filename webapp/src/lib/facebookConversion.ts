


export function reportFacebookConversion(value) {
  (window as any).fbq('track', 'Subscribe', {
    value: value,
    currency: 'USD',
  });
}