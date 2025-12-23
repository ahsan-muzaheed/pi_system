document.addEventListener("DOMContentLoaded", () => {
  const status = document.getElementById("status");

  document.querySelectorAll(".trigger-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const encodedMachineId = btn.dataset.machineId;
      status.textContent = "Sending...";

      try {
        const resp = await fetch("/trigger/" + encodedMachineId, {
          method: "GET"
        });

        const text = await resp.text();

        if (!resp.ok) {
          status.textContent = "ERROR: " + text;
          return;
        }

        status.textContent = "OK: " + text;
      } catch (err) {
        status.textContent =
          "ERROR: " + (err && err.message ? err.message : String(err));
      }
    });
  });
});
