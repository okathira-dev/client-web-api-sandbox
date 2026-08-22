import { readFile } from "node:fs/promises";

const paymentRoot = new URL("../../public/busybox/payment/", import.meta.url);

type PaymentAppManifest = {
  name: string;
  short_name: string;
  icons: readonly { src: string; type: string }[];
  serviceworker: { src: string; scope: string; use_cache: boolean };
};

describe("S-780 fictional Payment Handler fixtures", () => {
  it("publishes two distinct apps for the same payment method", async () => {
    const methodManifest = JSON.parse(
      await readFile(
        new URL("payment-method-manifest.json", paymentRoot),
        "utf8",
      ),
    ) as { default_applications: readonly string[] };

    expect(methodManifest.default_applications).toEqual([
      "./wallet-circle/payment-app-manifest.json",
      "./wallet-diamond/payment-app-manifest.json",
    ]);

    const apps = await Promise.all(
      methodManifest.default_applications.map(async (manifestPath) => {
        const manifestUrl = new URL(manifestPath, paymentRoot);
        const manifest = JSON.parse(
          await readFile(manifestUrl, "utf8"),
        ) as PaymentAppManifest;
        await expect(
          readFile(new URL(manifest.serviceworker.src, manifestUrl), "utf8"),
        ).resolves.toContain("BUSYBOX_WALLET");
        await expect(
          readFile(new URL(manifest.icons[0]?.src ?? "", manifestUrl), "utf8"),
        ).resolves.toContain("<svg");
        await expect(
          readFile(new URL("payment-handler-window.html", manifestUrl), "utf8"),
        ).resolves.toContain("payment-handler-window.js");
        return manifest;
      }),
    );

    expect(new Set(apps.map((app) => app.name)).size).toBe(2);
    expect(new Set(apps.map((app) => app.short_name)).size).toBe(2);
    for (const app of apps) {
      expect(app.serviceworker).toEqual({
        src: "./payment-handler-sw.js",
        scope: "./",
        use_cache: false,
      });
      expect(app.icons[0]?.type).toBe("image/svg+xml");
    }
  });

  it("keeps the common worker and handler-window runtimes self-hosted", async () => {
    await expect(
      readFile(new URL("payment-handler-runtime.js", paymentRoot), "utf8"),
    ).resolves.toContain('type: "handler-event"');
    await expect(
      readFile(new URL("payment-handler-window.js", paymentRoot), "utf8"),
    ).resolves.toContain('type: "handler-action"');
  });
});
