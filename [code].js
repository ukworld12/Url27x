export async function onRequestGet({
  request,
  params,
  env
}) {
  const code = String(params.code || "");

  if (!/^[A-Za-z0-9_-]{3,32}$/.test(code)) {
    return new Response("Not found", {
      status: 404
    });
  }

  const row = await env.DB
    .prepare(
      `SELECT id, url, expires_at
       FROM links
       WHERE code = ?1`
    )
    .bind(code)
    .first();

  if (!row) {
    return new Response("Short link not found", {
      status: 404
    });
  }

  if (
    row.expires_at &&
    new Date(row.expires_at).getTime() <= Date.now()
  ) {
    return new Response("This short link has expired.", {
      status: 410
    });
  }

  await env.DB
    .prepare(
      "UPDATE links SET clicks = clicks + 1 WHERE id = ?1"
    )
    .bind(row.id)
    .run();

  return Response.redirect(row.url, 302);
}
