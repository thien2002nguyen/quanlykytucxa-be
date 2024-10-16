export const parseExpiration = (expiration: string): number => {
  const timeUnit = expiration.slice(-1);
  const timeValue = parseInt(expiration.slice(0, -1), 10);

  switch (timeUnit) {
    case 's': // giây
      return timeValue;
    case 'm': // phút
      return timeValue * 60;
    case 'h': // giờ
      return timeValue * 3600;
    case 'd': // ngày
      return timeValue * 86400;
    default:
      throw new Error('Định dạng thời gian không hợp lệ');
  }
};
