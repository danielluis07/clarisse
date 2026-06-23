import MercadoPagoConfig, {
  InvalidWebhookSignatureError,
  Payment,
  Preference,
  SignatureFailureReason,
  WebhookSignatureValidator,
} from "mercadopago";
import { env } from "@/lib/env";

export const mpClient = new MercadoPagoConfig({
  accessToken: env.MP_ACCESS_TOKEN,
});

export const mpPreference = new Preference(mpClient);
export const mpPayment = new Payment(mpClient);

const WEBHOOK_SIGNATURE_TOLERANCE_SECONDS = 300;

const getSignatureTimestamp = (xSignature: string | null) => {
  if (!xSignature) return null;

  for (const part of xSignature.split(",")) {
    const [key, value] = part.split("=");
    if (key?.trim().toLowerCase() === "ts" && value?.trim()) {
      return value.trim();
    }
  }

  return null;
};

const assertSignatureTimestampIsRecent = ({
  xSignature,
  xRequestId,
}: {
  xSignature: string | null;
  xRequestId: string | null;
}) => {
  const timestamp = getSignatureTimestamp(xSignature);
  if (!timestamp || !/^\d+$/.test(timestamp)) return;

  const rawTimestamp = Number(timestamp);
  const timestampMs =
    rawTimestamp < 10_000_000_000 ? rawTimestamp * 1000 : rawTimestamp;
  const driftSeconds = Math.abs(Date.now() - timestampMs) / 1000;

  if (driftSeconds > WEBHOOK_SIGNATURE_TOLERANCE_SECONDS) {
    throw new InvalidWebhookSignatureError(
      SignatureFailureReason.TimestampOutOfTolerance,
      xRequestId ?? undefined,
      timestamp,
    );
  }
};

export const validateMercadoPagoWebhookSignature = ({
  xSignature,
  xRequestId,
  dataId,
  dataIdCandidates,
}: {
  xSignature: string | null;
  xRequestId: string | null;
  dataId?: string | null;
  dataIdCandidates?: Array<string | null | undefined>;
}) => {
  const candidates = [
    ...(dataIdCandidates ?? []),
    ...(dataIdCandidates ? [] : [dataId]),
  ];
  const normalizedCandidates = [
    ...new Set(candidates.map((candidate) => candidate ?? null)),
  ];
  const candidatesToTry = normalizedCandidates.length
    ? normalizedCandidates
    : [null];

  let signatureMismatch: InvalidWebhookSignatureError | null = null;

  for (const candidate of candidatesToTry) {
    try {
      WebhookSignatureValidator.validate({
        xSignature,
        xRequestId,
        dataId: candidate,
        secret: env.MP_WEBHOOK_SECRET,
      });

      assertSignatureTimestampIsRecent({ xSignature, xRequestId });
      return;
    } catch (error) {
      if (
        error instanceof InvalidWebhookSignatureError &&
        error.reason === SignatureFailureReason.SignatureMismatch
      ) {
        signatureMismatch = error;
        continue;
      }

      throw error;
    }
  }

  if (signatureMismatch) throw signatureMismatch;
};

export { InvalidWebhookSignatureError };
