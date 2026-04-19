interface VippsPaymentParams {
  orderId: number;
  amount: number;
  returnUrl: string;
  callbackUrl: string;
}

interface VippsPaymentResult {
  url: string | null;
  reference: string | null;
  error?: string;
}

async function getVippsToken(): Promise<string> {
  const clientId = process.env.VIPPS_CLIENT_ID;
  const clientSecret = process.env.VIPPS_CLIENT_SECRET;
  const subscriptionKey = process.env.VIPPS_SUBSCRIPTION_KEY;
  const apiUrl = process.env.VIPPS_API_URL ?? "https://apitest.vipps.no";

  if (!clientId || !clientSecret || !subscriptionKey) {
    throw new Error("Vipps-konfigurasjon mangler. Sjekk .env-filen.");
  }

  const res = await fetch(`${apiUrl}/accesstoken/get`, {
    method: "POST",
    headers: {
      "client_id": clientId,
      "client_secret": clientSecret,
      "Ocp-Apim-Subscription-Key": subscriptionKey,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Vipps token-feil: ${body}`);
  }

  const data = await res.json();
  return data.access_token;
}

export async function initiateVippsPayment(params: VippsPaymentParams): Promise<VippsPaymentResult> {
  const msn = process.env.VIPPS_MSN;
  const subscriptionKey = process.env.VIPPS_SUBSCRIPTION_KEY;
  const apiUrl = process.env.VIPPS_API_URL ?? "https://apitest.vipps.no";
  const systemName = process.env.VIPPS_SYSTEM_NAME ?? "elektro4-kiosk";

  if (!msn || !subscriptionKey || !process.env.VIPPS_CLIENT_ID) {
    console.warn("Vipps ikke konfigurert — hopper over betaling");
    return { url: null, reference: null };
  }

  const token = await getVippsToken();
  const reference = `elektro4-${params.orderId}-${Date.now()}`;

  const res = await fetch(`${apiUrl}/epayment/v1/payments`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Ocp-Apim-Subscription-Key": subscriptionKey,
      "Merchant-Serial-Number": msn,
      "Vipps-System-Name": systemName,
      "Vipps-System-Version": "1.0.0",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: {
        currency: "NOK",
        value: params.amount,
      },
      paymentMethod: { type: "WALLET" },
      reference,
      returnUrl: params.returnUrl,
      userFlow: "WEB_REDIRECT",
      paymentDescription: `Elektro 4 Kiosk – Ordre #${params.orderId}`,
      profile: { scope: "name phoneNumber" },
      webhooks: [
        {
          url: params.callbackUrl,
          authorizationHeader: `Bearer ${process.env.VIPPS_WEBHOOK_SECRET ?? ""}`,
          events: ["epayments.payment.authorized.v1", "epayments.payment.aborted.v1"],
        },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("Vipps betalingsfeil:", body);
    return { url: null, reference: null, error: body };
  }

  const data = await res.json();
  return {
    url: data.redirectUrl,
    reference: data.reference,
  };
}

export async function captureVippsPayment(reference: string): Promise<boolean> {
  const msn = process.env.VIPPS_MSN;
  const subscriptionKey = process.env.VIPPS_SUBSCRIPTION_KEY;
  const apiUrl = process.env.VIPPS_API_URL ?? "https://apitest.vipps.no";

  if (!msn || !subscriptionKey || !process.env.VIPPS_CLIENT_ID) return false;

  const token = await getVippsToken();

  const res = await fetch(`${apiUrl}/epayment/v1/payments/${reference}/capture`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Ocp-Apim-Subscription-Key": subscriptionKey,
      "Merchant-Serial-Number": msn,
      "Idempotency-Key": reference,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ modificationAmount: { currency: "NOK", value: 0 } }),
  });

  return res.ok;
}
