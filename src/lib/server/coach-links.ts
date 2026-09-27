import "server-only";
import { lookup } from "node:dns/promises";
import { request } from "node:https";
import { isIP, BlockList } from "node:net";
const blocked = new BlockList();
for (const [network, prefix] of [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.168.0.0", 16],
  ["100.64.0.0", 10],
  ["198.18.0.0", 15],
  ["192.0.0.0", 24],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
] as const)
  blocked.addSubnet(network, prefix, "ipv4");
export function publicAddress(address: string) {
  const version = isIP(address);
  return version === 4
    ? !blocked.check(address, "ipv4")
    : version === 6 && /^[23][0-9a-f]{3}:/i.test(address);
}
export async function verifySourceLink(raw: string): Promise<string | null> {
  try {
    const deadline = Date.now() + 12000;
    let target = raw;
    for (let n = 0; n < 4; n++) {
      if (Date.now() >= deadline) return null;
      const u = new URL(target);
      if (
        u.protocol !== "https:" ||
        u.username ||
        u.password ||
        (u.port && u.port !== "443") ||
        u.hostname.endsWith(".local")
      )
        return null;
      const host = u.hostname.replace(/^\[|\]$/g, "");
      const ips = isIP(host)
        ? [{ address: host, family: isIP(host) }]
        : await Promise.race([
            lookup(host, { all: true }),
            new Promise<never>((_, reject) => {
              const timer = setTimeout(
                () => reject(Error("DNS timeout")),
                Math.max(1, deadline - Date.now()),
              );
              timer.unref();
            }),
          ]);
      if (!ips.length || ips.some((x) => !publicAddress(x.address)))
        return null;
      const ip = ips[0];
      const answer = await new Promise<{ status: number; location?: string }>(
        (resolve, reject) => {
          const req = request(
            u,
            {
              method: "GET",
              signal: AbortSignal.timeout(Math.max(1, deadline - Date.now())),
              family: ip.family,
              headers: {
                "User-Agent": "PWD-Learning-Source-Check/1.0",
                Range: "bytes=0-0",
              },
              lookup: (_host, _opts, cb) => cb(null, ip.address, ip.family),
            },
            (res) => {
              resolve({
                status: res.statusCode || 0,
                location: res.headers.location,
              });
              res.destroy();
            },
          );
          req.setTimeout(7000, () => req.destroy(Error("Link check timeout")));
          req.on("error", reject);
          req.end();
        },
      );
      if (answer.status >= 200 && answer.status < 300) return u.href;
      if (answer.status >= 300 && answer.status < 400 && answer.location) {
        target = new URL(answer.location, u).href;
        continue;
      }
      return null;
    }
    return null;
  } catch {
    return null;
  }
}
