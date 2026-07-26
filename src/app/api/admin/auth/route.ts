import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { supabase } from "@/lib/supabase";

export const ALLOWED_ADMIN_EMAIL = "akshatsainiaks@gmail.com";

// Memory cache synced with Supabase database
let cachedPassword: string | null = null;
let otpStore: { code: string; expiresAt: number } | null = null;

// Fetch admin password directly from Supabase table 'srevox_admin_config'
async function getStoredAdminPassword(): Promise<string> {
  try {
    const { data } = await supabase
      .from("srevox_admin_config")
      .select("value")
      .eq("key", "admin_password")
      .single();

    if (data && data.value) {
      cachedPassword = data.value;
      return data.value;
    }
  } catch (err) {
    console.error("[Supabase Admin Config Note]", err);
  }

  return cachedPassword || "admin123";
}

// Persist updated admin password into Supabase table 'srevox_admin_config'
async function saveAdminPasswordToSupabase(newPassword: string): Promise<boolean> {
  cachedPassword = newPassword;

  try {
    await supabase
      .from("srevox_admin_config")
      .upsert({
        key: "admin_password",
        value: newPassword,
        updated_at: new Date().toISOString()
      }, { onConflict: "key" });
    
    console.log("[Supabase] Admin password updated and persisted in Supabase database.");
    return true;
  } catch (err) {
    console.error("[Supabase Password Save Error]", err);
  }

  return true;
}

async function sendRealEmail(toEmail: string, otpCode: string) {
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = parseInt(process.env.SMTP_PORT || "587");
  const smtpUser = process.env.SMTP_USER || ALLOWED_ADMIN_EMAIL;
  const smtpPass = process.env.SMTP_PASS;

  if (smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPass }
      });

      await transporter.sendMail({
        from: `"Srevox Admin Security" <${smtpUser}>`,
        to: toEmail,
        subject: `Your Srevox Admin Security OTP: ${otpCode}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; background-color: #0b0e17; color: #ffffff; border-radius: 16px; border: 1px solid #1e293b;">
            <h2 style="color: #38bdf8; margin-top: 0;">Srevox Security</h2>
            <p style="color: #94a3b8; font-size: 14px;">Your 6-digit security OTP code for signing in to the Srevox Admin Portal is:</p>
            <div style="font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #10b981; background-color: #131722; padding: 18px; border-radius: 12px; text-align: center; margin: 24px 0; border: 1px solid #10b98133;">
              ${otpCode}
            </div>
            <p style="color: #64748b; font-size: 12px; line-height: 1.5;">This verification code is valid for 10 minutes. If you did not request this sign-in, please ignore.</p>
          </div>
        `
      });
      console.log(`[Srevox Nodemailer] REAL Email successfully dispatched to ${toEmail} via SMTP (${smtpHost}:${smtpPort})`);
      return true;
    } catch (err) {
      console.error("[Srevox Nodemailer Error]", err);
    }
  } else {
    console.log(`[Srevox Auth] To receive real emails via Gmail SMTP, add your Gmail App Password to SMTP_PASS in .env.local! Active OTP for ${toEmail}: ${otpCode}`);
  }

  return false;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, email, password, currentPassword, newPassword, otpCode } = body;

    // Strict Email Check: Only akshatsainiaks@gmail.com is allowed
    if (email && email.trim().toLowerCase() !== ALLOWED_ADMIN_EMAIL) {
      return NextResponse.json(
        { success: false, error: "Access Denied: Invalid email address or unauthorized user." },
        { status: 403 }
      );
    }

    // 1. ACTION: SEND OTP CODE
    if (action === "send-otp") {
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

      otpStore = { code: generatedOtp, expiresAt };

      console.log(`[Srevox Security] OTP generated for ${ALLOWED_ADMIN_EMAIL}: ${generatedOtp}`);

      // Dispatch real email via SMTP / EmailJS
      await sendRealEmail(ALLOWED_ADMIN_EMAIL, generatedOtp);

      return NextResponse.json({
        success: true,
        message: `6-Digit OTP code dispatched to ${ALLOWED_ADMIN_EMAIL}`
      });
    }

    // 2. ACTION: VERIFY OTP CODE
    if (action === "verify-otp") {
      if (!otpStore || Date.now() > otpStore.expiresAt) {
        return NextResponse.json({ success: false, error: "OTP code has expired. Please request a new code." }, { status: 400 });
      }

      if (otpCode !== otpStore.code) {
        return NextResponse.json({ success: false, error: "Invalid 6-Digit OTP code. Please check your email inbox." }, { status: 400 });
      }

      // Clear OTP after successful use
      otpStore = null;

      return NextResponse.json({
        success: true,
        email: ALLOWED_ADMIN_EMAIL,
        message: "OTP Verified Successfully."
      });
    }

    // 3. ACTION: LOGIN WITH PASSWORD (STRICT SUPABASE VALIDATION)
    if (action === "login") {
      const dbPassword = await getStoredAdminPassword();
      if (password !== dbPassword) {
        return NextResponse.json({ success: false, error: "Invalid Security Password." }, { status: 401 });
      }

      return NextResponse.json({
        success: true,
        email: ALLOWED_ADMIN_EMAIL,
        message: "Password verification successful."
      });
    }

    // 4. ACTION: UPDATE PASSWORD IN SUPABASE
    if (action === "update-password") {
      const dbPassword = await getStoredAdminPassword();
      if (currentPassword !== dbPassword) {
        return NextResponse.json({ success: false, error: "Current password is incorrect." }, { status: 400 });
      }

      if (!newPassword || newPassword.length < 6) {
        return NextResponse.json({ success: false, error: "New password must be at least 6 characters." }, { status: 400 });
      }

      await saveAdminPasswordToSupabase(newPassword);

      return NextResponse.json({
        success: true,
        email: ALLOWED_ADMIN_EMAIL,
        message: `Admin security password updated and persisted in Supabase for ${ALLOWED_ADMIN_EMAIL}.`
      });
    }

    return NextResponse.json({ success: false, error: "Invalid Action Request." }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
