import { serve } from "@hono/node-server";
import { Hono } from "hono";
import speakeasy from "speakeasy";
import QRCode from "qrcode";

const app = new Hono();

// Add CORS middleware
app.use("*", async (c, next) => {
  c.header("Access-Control-Allow-Origin", "http://localhost:3000");
  c.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  c.header("Access-Control-Allow-Headers", "Content-Type");
  await next();
});

// Handle OPTIONS requests for CORS preflight
app.options("*", (c) => {
  return c.text("", 200);
});


app.get("/", async (c) => {
  return c.json({
    message: "Hey There, I'm Rohit Luni",
  });
});

app.get("/api/mfa/setup", async (c) => {
  const name = c.req.query("name");
  const secret = speakeasy.generateSecret({
    length: 20,
    name: `Ennenni:${name}`,
    
  });


  const otpAuthUrl = speakeasy.otpauthURL({
    secret: secret.base32,
    label: `Ennenni:${name}`,
    encoding: "base32",
    digits: 6,
    period: 60,
  });

  const qrCodeUrl = await QRCode.toDataURL(otpAuthUrl || "");

  if (!otpAuthUrl) {
    return c.json(
      {
        status: "Failed",
        message: "Failed to generate OTP auth URL",
      },
      500
    );
  }

  return c.json({
    secret,
    qrCodeUrl,
  });
});

app.post("/api/mfa/verify", async (c) => {
  const { code, secret } = await c.req.json();

  const verified = speakeasy.totp.verify({
    secret: secret,
    token: code,
    encoding: "base32",
    window: 4, // Allow a 4-step window for time sync issues
  });

  if (!verified) {
    return c.json(
      {
        status: "Failed",
        message: "Invalid code",
      },
      400
    );
  }

  return c.json({
    verified,
    status: "Success",
  });
});

serve(
  {
    fetch: app.fetch,
    port: 3002,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
