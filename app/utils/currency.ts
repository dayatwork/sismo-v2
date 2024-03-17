const USDollar = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});
const IDRupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
});

export const currencyFormatter = (
  currency: string,
  amount: number | bigint
) => {
  if (currency === "USD") {
    return USDollar.format(amount);
  }
  if (currency === "IDR") {
    return IDRupiah.format(amount);
  }
};
