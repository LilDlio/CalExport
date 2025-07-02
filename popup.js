document.getElementById("toSheet").addEventListener("click", () => {
  const month = document.getElementById("monthPicker").value;
  getToken((token) => {
    fetchCalendarEvents(token, true, month);
  });
});

document.getElementById("toExcel").addEventListener("click", () => {
  const month = document.getElementById("monthPicker").value;
  getToken((token) => {
    fetchCalendarEvents(token, false, month);
  });
});

function getToken(callback) {
  chrome.runtime.sendMessage({ action: "getAuthToken" }, (response) => {
    if (response.success) {
      callback(response.token);
    } else {
      console.error("Failed to get token:", response.error);
      alert("Lấy token thất bại, vui lòng thử lại.");
    }
  });
}

function fetchCalendarEvents(token, toSheet, month) {
  fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=1000",
    {
      headers: {
        Authorization: "Bearer " + token,
      },
    }
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Lỗi khi gọi API: " + response.statusText);
      }
      return response.json();
    })
    .then((data) => {
      let events = data.items.map((e) => ({
        Summary: e.summary || "",
        Start: e.start?.dateTime || e.start?.date || "",
        End: e.end?.dateTime || e.end?.date || "",
        Location: e.location || "",
        Organizer: e.organizer?.email || "",
        Attendees: (e.attendees || [])
          .map((a) => `${a.email} (${a.responseStatus})`)
          .join(", "),
        Status: e.status || "",
        Transparency: e.transparency || "",
        MeetLink: e.conferenceData?.entryPoints?.[0]?.uri || "",
        Attachment: (e.attachments || []).map((a) => a.fileUrl).join(", "),
        Description: e.description || "",
        UID: e.id || "",
        Created: e.created || "",
        Updated: e.updated || "",
      }));

      if (month) {
        events = events.filter((e) => {
          if (!e.Start) return false;
          return e.Start.startsWith(month);
        });
      }

      if (events.length === 0) {
        alert("Không tìm thấy sự kiện trong tháng đã chọn.");
        return;
      }

      if (toSheet) {
        exportToGoogleSheet(events, token);
      } else {
        exportToXLSX(events);
      }
    })
    .catch((error) => {
      console.error("Lỗi khi fetch sự kiện:", error);
      alert("Có lỗi xảy ra khi lấy sự kiện: " + error.message);
    });
}

function exportToXLSX(events) {
  const worksheet = XLSX.utils.json_to_sheet(events);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "CalendarEvents");

  const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([wbout], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;

  const now = new Date();
  const pad = (n) => n.toString().padStart(2, "0");
  const formattedDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
    now.getDate()
  )} ${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
  a.download = `Calendar Export ${formattedDate}.xlsx`;

  a.click();
  URL.revokeObjectURL(url);
}

async function exportToGoogleSheet(events, token) {
  try {
    const createResponse = await fetch(
      "https://sheets.googleapis.com/v4/spreadsheets",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          properties: {
            title: "Calendar Export " + new Date().toLocaleString(),
          },
        }),
      }
    );

    if (!createResponse.ok) {
      throw new Error(
        "Tạo Google Sheet thất bại: " + createResponse.statusText
      );
    }

    const sheetData = await createResponse.json();
    const spreadsheetId = sheetData.spreadsheetId;

    const headers = Object.keys(events[0]);
    const values = events.map((e) => headers.map((h) => e[h]));

    const body = {
      range: "Sheet1!A1",
      majorDimension: "ROWS",
      values: [headers, ...values],
    };

    const updateResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1?valueInputOption=USER_ENTERED`,
      {
        method: "PUT",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!updateResponse.ok) {
      throw new Error(
        "Ghi dữ liệu vào Google Sheet thất bại: " + updateResponse.statusText
      );
    }

    alert(
      `✅ Đã xuất thành công ${events.length} sự kiện lên Google Sheet.\n📄 Mở file tại: https://docs.google.com/spreadsheets/d/${spreadsheetId}`
    );
    window.open(
      `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
      "_blank"
    );
  } catch (error) {
    console.error(error);
    alert("Lỗi khi xuất sang Google Sheet: " + error.message);
  }
}
