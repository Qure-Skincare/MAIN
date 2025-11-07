(async () => {

  document.addEventListener("cart.requestComplete", () => {
    const sectionFileHandle = "endrock-gamification-header";
    const elementIdToUpdate = "endrock_gamificationHeader";

    if (typeof updateSection === "function") {
      updateSection(sectionFileHandle, elementIdToUpdate)
        .then(() => console.log("✅ Header gamification updated"))
        .catch((error) =>
          console.error(
            "❌ Failed to update Header Gamification section:",
            error
          )
        );
    } else {
      console.warn("⚠️ updateSection() is not defined");
    }
  });


  // this code can be commented after a few weeks to clean up old gifts
  
  const oldGiftHandle = "micro-infusion-targeted-patches-single";

  try {
    const cart = await fetch("/cart.js").then((res) => res.json());

    const oldGiftItem = cart.items.find(
      (item) =>
        item.handle === oldGiftHandle && item.properties?._required_validation
    );

    if (!oldGiftItem) return;

    const removeOldGift = async (attempt = 1) => {
      try {
        const res = await fetch("/cart/change.js", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: oldGiftItem.key, quantity: 0 }),
        });

        if (res.status === 409) {
          const delay = Math.min(1000 * attempt, 5000);
          console.warn(`Conflict (409). Retry #${attempt} in ${delay}ms`);
          return setTimeout(() => removeOldGift(attempt + 1), delay);
        }

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        console.log("✅ Removed old free gift");

        const event = new CustomEvent("cart.requestComplete", {
          detail: { source: "removeOldGift" },
        });
        document.dispatchEvent(event);
      } catch (err) {
        if (attempt < 5) {
          const delay = 1000 * attempt;
          console.warn(
            `Error removing gift, retrying #${attempt} in ${delay}ms`,
            err
          );
          setTimeout(() => removeOldGift(attempt + 1), delay);
        } else {
          console.error(
            "❌ Failed to remove old gift after multiple attempts",
            err
          );
        }
      }
    };

    removeOldGift();
  } catch (error) {
    console.error("❌ Failed to fetch cart.js:", error);
  }
})();
