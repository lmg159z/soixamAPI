// const SHEET_ID = "1s55kJ_HEob8U3AJvZfCw_fqOm1UU8iGpPzXyRIryoDc";
// const DEFAULT_GID = "1650097928";

// // ─── Handler ─────────────────────────────────────────────────────────────────

// export default async function handler(req, res) {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type");

//   if (req.method === "OPTIONS") return res.status(200).end();

//   try {
//     res.status(200).json(await getDATA());
//   } catch (error) {
//     console.error("Server Error:", error);
//     res.status(500).json({ error: "Lỗi hệ thống", details: error.message });
//   }
// }

// // ─── Sheet ───────────────────────────────────────────────────────────────────

// async function getSheetAsKeyValue(GID = DEFAULT_GID) {
//   const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?gid=${GID}&tqx=out:json`;

//   const text = await fetch(url).then((r) => r.text());
//   const jsonText = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*?)\);/)?.[1];
//   if (!jsonText) return [];

//   const { table } = JSON.parse(jsonText);

//   const labelKeys = table.cols.map((col) => col.label?.trim() ?? "");
//   const hasLabels = labelKeys.some(Boolean);

//   const keys = hasLabels
//     ? labelKeys
//     : table.rows[0]?.c.map((cell) => (cell?.v != null ? String(cell.v).trim() : "")) ?? [];

//   const rows = hasLabels ? table.rows : table.rows.slice(1);

//   return rows.map((row) =>
//     Object.fromEntries(
//       (row.c ?? [])
//         .map((cell, i) => [keys[i], cell?.v != null ? String(cell.v).trim() : null])
//         .filter(([k]) => k)
//     )
//   );
// }

// // ─── Data ────────────────────────────────────────────────────────────────────

// async function getDATA() {
//   const list = await getSheetAsKeyValue();

//   const listDATA = await Promise.all(
//     list.map(async ({ id, nameAPP: name, logoAPP: logo, timeUpdate }) => ({
//       id,
//       name,
//       logo,
//       timeUpdate,
//       data: await getSheetAsKeyValue(id),
//     }))
//   );

//   return mergeStreamData(listDATA);
// }

// function mergeStreamData(input) {
//   const appMap = new Map();
//   const channelMap = new Map();

//   for (const { name, logo, timeUpdate, data } of input) {
//     if (!appMap.has(name)) appMap.set(name, { name, logo, timeUpdate });

//     for (const { id, name: chName, acronym, ...rest } of data) {
//       if (!channelMap.has(id)) channelMap.set(id, { id, name: chName, acronym, list: [] });
//       channelMap.get(id).list.push(rest);
//     }
//   }

//   return {
//     info: {
//       listAPP: [...appMap.keys()],
//       quantityChannels: channelMap.size,
//       APP: [...appMap.values()],
//     },
//     data: [...channelMap.values()],
//   };
// }


const SHEET_ID = "1s55kJ_HEob8U3AJvZfCw_fqOm1UU8iGpPzXyRIryoDc";
const DEFAULT_GID = "1650097928";

// ─── AUTH CONFIG ─────────────────────────────────────────────

const USERNAME = "admin";
const SECRET_KEY = "sxtv";

// ─── Handler ─────────────────────────────────────────────────

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const { username, password } = req.body || {};

    // Check username
    if (username !== USERNAME) {
      return res.status(401).json({
        error: "Sai username",
      });
    }

    // Generate password hiện tại
    const currentPassword = generatePassword();

    // Check password
    if (password !== currentPassword) {
      return res.status(401).json({
        error: "Sai password",
        currentFormat: "fuck del pass thì cut",
      });
    }

    // OK
    const data = await getDATA();

    return res.status(200).json(data);

  } catch (error) {
    console.error("Server Error:", error);

    return res.status(500).json({
      error: "Lỗi hệ thống",
      details: error.message,
    });
  }
}

// ─── PASSWORD GENERATOR ──────────────────────────────────────

function generatePassword() {
  const now = new Date(
    new Date().toLocaleString("en-US", {
      timeZone: "Asia/Ho_Chi_Minh",
    })
  );

  const HH = String(now.getHours()).padStart(2, "0");
  const DD = String(now.getDate()).padStart(2, "0");
  const MM = String(now.getMonth() + 1).padStart(2, "0");

  return `${HH}${DD}${MM}${SECRET_KEY}`;
}

// ─── Sheet ───────────────────────────────────────────────────

async function getSheetAsKeyValue(GID = DEFAULT_GID) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?gid=${GID}&tqx=out:json`;

  const text = await fetch(url).then((r) => r.text());

  const jsonText = text.match(
    /google\.visualization\.Query\.setResponse\(([\s\S]*?)\);/
  )?.[1];

  if (!jsonText) return [];

  const { table } = JSON.parse(jsonText);

  const labelKeys = table.cols.map((col) => col.label?.trim() ?? "");

  const hasLabels = labelKeys.some(Boolean);

  const keys = hasLabels
    ? labelKeys
    : table.rows[0]?.c.map((cell) =>
        cell?.v != null ? String(cell.v).trim() : ""
      ) ?? [];

  const rows = hasLabels ? table.rows : table.rows.slice(1);

  return rows.map((row) =>
    Object.fromEntries(
      (row.c ?? [])
        .map((cell, i) => [
          keys[i],
          cell?.v != null ? String(cell.v).trim() : null,
        ])
        .filter(([k]) => k)
    )
  );
}

// ─── Data ────────────────────────────────────────────────────

async function getDATA() {
  const list = await getSheetAsKeyValue();

  const listDATA = await Promise.all(
    list.map(async ({ id, nameAPP: name, logoAPP: logo, timeUpdate }) => ({
      id,
      name,
      logo,
      timeUpdate,
      data: await getSheetAsKeyValue(id),
    }))
  );

  return mergeStreamData(listDATA);
}

function mergeStreamData(input) {
  const appMap = new Map();
  const channelMap = new Map();

  for (const { name, logo, timeUpdate, id, data } of input) {
    if (!appMap.has(name)) {
      appMap.set(name, {
        name,
        logo,
        id,
        timeUpdate,
      });
    }

    for (const { id, name: chName, acronym, ...rest } of data) {
      if (!channelMap.has(id)) {
        channelMap.set(id, {
          id,
          name: chName,
          acronym,
          list: [],
        });
      }

      channelMap.get(id).list.push(rest);
    }
  }

  return {
    info: {
      listAPP: [...appMap.keys()],
      quantityChannels: channelMap.size,
      APP: [...appMap.values()],
    },
    data: [...channelMap.values()],
  };
}