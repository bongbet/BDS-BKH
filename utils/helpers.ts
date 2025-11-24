export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const formatCurrency = (amount: number, currency: string = 'VND'): string => {
  if (isNaN(amount)) return '';
  switch (currency) {
    case 'VND':
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    case 'USD':
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    case '/tháng':
        return new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ/tháng';
    default:
      return `${amount} ${currency}`;
  }
};

export const formatArea = (area: number): string => {
  if (isNaN(area)) return '';
  return `${new Intl.NumberFormat('vi-VN').format(area)} m²`;
};

export const formatNumber = (num: number): string => {
  if (isNaN(num)) return '';
  return new Intl.NumberFormat('vi-VN').format(num);
};