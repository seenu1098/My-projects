// @todo make this dynamic based on card type detected
export function cardMaskFactory() {
  return {
    placeholderChar: '\u2000',
    mask: [
      /\d/, /\d/, /\d/, /\d/,
      '\u2002',
      /\d/, /\d/, /\d/, /\d/,
      '\u2002',
      /\d/, /\d/, /\d/, /\d/,
      '\u2002',
      /\d/, /\d/, /\d/, /\d/,
    ],
  };
}

export const expiryMask = {
  placeholderChar: '\u2000',
  mask: (rawValue?: string) => {
    const month = [/[0-1]/, /[1-9]/];
    const year = ['\u2002', '/', '\u2002', /\d/, /\d/, /\d/, /\d/];
    if (rawValue && rawValue.length && rawValue[0] === '1') {
      month[1] = /[0-2]/;
    }

    return [...month, ...year];
  },
};

export const ccvMask = {
  placeholderChar: '\u2000',
  mask: [/\d/, /\d/, /\d/],
};