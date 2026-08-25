const form = document.querySelector("#form");
const message = document.querySelector("#message");
const result = document.querySelector("#result");
const shortUrl = document.querySelector("#shortUrl");
const copy = document.querySelector("#copy");

form.addEventListener("submit", async (e) => {

  e.preventDefault();

  message.textContent = "";
  result.classList.add("hidden");

  const button = form.querySelector("button");

  button.disabled = true;
  button.textContent = "Creating...";

  try {

    const response = await fetch("/api/shorten", {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({

        url: document
          .querySelector("#url")
          .value
          .trim(),

        custom: document
          .querySelector("#custom")
          .value
          .trim(),

        expiresAt:
          document.querySelector("#expiresAt").value || null
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Unable to create link."
      );
    }

    shortUrl.href = data.shortUrl;
    shortUrl.textContent = data.shortUrl;

    result.classList.remove("hidden");

  } catch (error) {

    message.textContent =
      error.message || "Something went wrong.";

  } finally {

    button.disabled = false;
    button.textContent = "Create short link";
  }
});


copy.addEventListener("click", async () => {

  try {

    await navigator.clipboard.writeText(
      shortUrl.textContent
    );

    copy.textContent = "Copied!";

    setTimeout(() => {

      copy.textContent = "Copy";

    }, 1200);

  } catch {

    message.textContent =
      "Unable to copy. Please copy the link manually.";

  }

});
