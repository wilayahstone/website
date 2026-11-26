// These payment currencies all use two decimal places. Display currencies are separate.
export const paymentCurrencies=['PKR','USD','GBP','EUR','CAD','AUD','NZD'] as const;
export type PaymentCurrency=typeof paymentCurrencies[number];
export function isPaymentCurrency(value:unknown):value is PaymentCurrency{return paymentCurrencies.includes(value as PaymentCurrency)}
export function quoteMoney(minor:number,currency='PKR'){return new Intl.NumberFormat('en-GB',{style:'currency',currency,currencyDisplay:'code',minimumFractionDigits:2}).format(minor/100)}
export type PaymentAvailability={available:boolean;test:boolean;currencies:string[]};
