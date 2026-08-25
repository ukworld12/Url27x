export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();

    const url = String(body?.url || "").trim();
    let custom = String(body?.custom || "").trim();
    const expiresAt = body?.expiresAt
      ? String(body.expiresAt)
      : null;

    try {
      const parsed = new URL(url);

      if (
        parsed.protocol !== "http:" &&
        parsed.protocol !== "https:"
      ) {
        throw new Error();
      }
    } catch {
      return Response.json(
        { error: "Enter a valid URL." },
        { status: 400 }
      );
    }

    if (!custom) {
      const chars =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

      custom = "";

      const bytes = new Uint8Array(6);
      crypto.getRandomValues(bytes);

      for (const byte of bytes) {
        custom += chars[byte % chars.length];
      }
    } else if (!/^[A-Za-z0-9_-]{3,32}$/.test(custom)) {
      return Response.json(
        {
          error:
            "Custom code must be 3-32 letters, numbers, _ or -."
        },
        { status: 400 }
      );
    }

    const existing = await env.DB
      .prepare("SELECT id FROM links WHERE code = ?1")
      .bind(custom)
      .first();

    if (existing) {
      return Response.json(
        { error: "That short code is already in use." },
        { status: 409 }
      );
    }

    await env.DB
      .prepare(
        `INSERT INTO links
         (code, url, expires_at)
         VALUES (?1, ?2, ?3)`
      )
      .bind(custom, url, expiresAt)
      .run();

    const origin = new URL(request.url).origin;

    return Response.json({
      code: custom,
      url: url,
      shortUrl: `${origin}/${custom}`
    });

  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Server error." },
      { status: 500 }
    );
  }
}
