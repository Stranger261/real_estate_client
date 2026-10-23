export const formatMoney = (value: number) => {
  const [whole, cents] = value.toFixed(2).split(".");
  return `₱${whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}.${cents}`;
};
