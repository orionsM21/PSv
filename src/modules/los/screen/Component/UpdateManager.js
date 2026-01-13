import RNFS from 'react-native-fs';
import RNRestart from 'react-native-restart';
import { unzip } from 'react-native-zip-archive';

const MANIFEST_URL = 'http://110.227.248.230:5567/updates/updates.json';
const ROOT = `${RNFS.DocumentDirectoryPath}/bundles`;
const META = `${ROOT}/meta.json`;
const LATEST = `${ROOT}/latest`;
const PREV = `${ROOT}/previous`;
const SAFE = `${ROOT}/.safe_start`;

export const checkForJsUpdate = async ({ autoRestart = false } = {}) => {
  try {
    if (await RNFS.exists(SAFE)) {
      console.warn("⚠️ OTA crash detected → rolling back...");
      await rollback();
      await RNFS.unlink(SAFE).catch(() => { });
      RNRestart.restart();
      return;
    }

    await RNFS.writeFile(SAFE, "1", "utf8").catch(() => { });

    const res = await fetch(MANIFEST_URL, { cache: "no-store" });
    const meta = await res.json();

    const remote = meta.latestBundleVersion;
    const local = await getLocalVersion();

    if (remote && remote !== local) {
      console.log(`⬇️ New OTA found → ${remote}`);
      await downloadAndApply(meta.bundleUrl, remote);

      if (autoRestart) {
        console.log("🔄 OTA applied → restarting…");

        setTimeout(async () => {
          await RNFS.unlink(SAFE).catch(() => { });

          // First restart attempt
          requestAnimationFrame(() => {
            RNRestart.restart();
          });

          // Backup force restart
          setTimeout(() => {
            RNRestart.restart();
          }, 1300);

        }, 900);
      }
    }

    setTimeout(() => RNFS.unlink(SAFE).catch(() => { }), 4000);

  } catch (e) {
    console.log("⚠️ OTA check failed:", e.message);
    RNFS.unlink(SAFE).catch(() => { });
  }
};

async function getLocalVersion() {
  try {
    if (!(await RNFS.exists(META))) return null;
    const txt = await RNFS.readFile(META, 'utf8');
    return JSON.parse(txt)?.version ?? null;
  } catch { return null; }
}

async function downloadAndApply(zipUrl, version) {
  await RNFS.mkdir(ROOT);

  const zip = `${ROOT}/bundle.zip`;

  if (await RNFS.exists(LATEST)) {
    if (await RNFS.exists(PREV)) await RNFS.unlink(PREV);
    await RNFS.moveFile(LATEST, PREV);
  }

  if (await RNFS.exists(zip)) await RNFS.unlink(zip);

  const r = await RNFS.downloadFile({ fromUrl: zipUrl, toFile: zip }).promise;

  await RNFS.mkdir(LATEST);
  await unzip(zip, LATEST);
  await RNFS.unlink(zip).catch(() => { });

  await RNFS.writeFile(META, JSON.stringify({ version }), "utf8");

  await new Promise(res => setTimeout(res, 300));

  console.log(`✅ OTA ${version} applied`);
}

async function rollback() {
  if (!(await RNFS.exists(PREV))) return;
  if (await RNFS.exists(LATEST)) await RNFS.unlink(LATEST);
  await RNFS.moveFile(PREV, LATEST);
  console.log("🔁 Rolled back to previous OTA bundle.");
}
