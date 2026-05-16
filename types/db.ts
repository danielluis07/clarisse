export type AddressSnapshot = {
  recipientName: string;
  phone?: string | null;
  country: string;
  postalCode: string;
  state: string;
  city: string;
  neighborhood?: string | null;
  addressLine1: string;
  addressLine2?: string | null;
  number?: string | null;
};
