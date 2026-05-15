// ============================================================
// EMAIL TEMPLATES FOR CINEBOOK
// All templates return HTML strings with dynamic data injected
// ============================================================

// ─── HELPER: BASE LAYOUT WRAPPER ───────────────────────────
function baseLayout(content, title = 'CineBook Notification') {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      background-color: #0f0f1a;
      color: #ffffff;
      padding: 20px;
    }
    .wrapper {
      max-width: 600px;
      margin: 0 auto;
      background: #1a1a2e;
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid #2a2a4a;
    }
    .header {
      background: linear-gradient(135deg, #e50914 0%, #b00710 100%);
      padding: 32px 24px;
      text-align: center;
    }
    .header h1 {
      font-size: 28px;
      font-weight: 800;
      letter-spacing: 2px;
      color: #ffffff;
    }
    .header p {
      color: rgba(255,255,255,0.85);
      margin-top: 6px;
      font-size: 14px;
    }
    .body {
      padding: 32px 24px;
    }
    .greeting {
      font-size: 20px;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 8px;
    }
    .subtitle {
      color: #a0a0c0;
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .card {
      background: #12122a;
      border: 1px solid #2a2a4a;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
    }
    .card-title {
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #e50914;
      margin-bottom: 14px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #2a2a4a;
      font-size: 14px;
    }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: #8080a0; }
    .info-value { color: #ffffff; font-weight: 600; text-align: right; }
    .badge {
      display: inline-block;
      background: rgba(229, 9, 20, 0.15);
      color: #e50914;
      border: 1px solid rgba(229, 9, 20, 0.3);
      border-radius: 20px;
      padding: 4px 12px;
      font-size: 12px;
      font-weight: 600;
    }
    .booking-id {
      background: #0f0f1a;
      border: 1px dashed #e50914;
      border-radius: 8px;
      padding: 12px 16px;
      font-family: monospace;
      font-size: 16px;
      letter-spacing: 2px;
      color: #e50914;
      text-align: center;
      margin-bottom: 20px;
    }
    .qr-section {
      text-align: center;
      padding: 20px;
      background: #ffffff;
      border-radius: 12px;
      margin-bottom: 20px;
    }
    .qr-section img {
      width: 180px;
      height: 180px;
      border-radius: 8px;
    }
    .qr-label {
      color: #333;
      font-size: 12px;
      margin-top: 8px;
      font-weight: 600;
    }
    .price-box {
      background: linear-gradient(135deg, #e50914, #b00710);
      border-radius: 12px;
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .price-label { color: rgba(255,255,255,0.8); font-size: 14px; }
    .price-amount { color: #ffffff; font-size: 26px; font-weight: 800; }
    .btn {
      display: block;
      background: #e50914;
      color: #ffffff;
      text-decoration: none;
      text-align: center;
      padding: 14px 24px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 15px;
      margin-bottom: 20px;
    }
    .divider {
      height: 1px;
      background: #2a2a4a;
      margin: 20px 0;
    }
    .footer {
      background: #0f0f1a;
      padding: 20px 24px;
      text-align: center;
      border-top: 1px solid #2a2a4a;
    }
    .footer p {
      color: #4a4a6a;
      font-size: 12px;
      line-height: 1.8;
    }
    .footer strong { color: #6060a0; }
    .seats-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 8px;
    }
    .seat-chip {
      background: #1a1a3a;
      border: 1px solid #e50914;
      color: #e50914;
      border-radius: 6px;
      padding: 4px 10px;
      font-size: 13px;
      font-weight: 600;
      font-family: monospace;
    }
    .highlight { color: #e50914; }
    .success-icon {
      font-size: 48px;
      margin-bottom: 12px;
    }
    @media (max-width: 480px) {
      .body { padding: 20px 16px; }
      .price-amount { font-size: 20px; }
      .header h1 { font-size: 22px; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    ${content}
  </div>
</body>
</html>
  `;
}

// ─── FOOTER REUSABLE BLOCK ──────────────────────────────────
function footerBlock() {
  return `
    <div class="footer">
      <p>
        🎬 <strong>CineBook</strong> — Your Ultimate Movie Booking Experience<br/>
        This is an automated email. Please do not reply.<br/>
        © ${new Date().getFullYear()} CineBook. All rights reserved.
      </p>
    </div>
  `;
}

// ============================================================
// TEMPLATE 1: WELCOME EMAIL (sent on registration)
// ============================================================
export function welcomeEmailTemplate({ name, email }) {
  const content = `
    <div class="header">
      <h1>🎬 CINEBOOK</h1>
      <p>Your Ultimate Movie Booking Experience</p>
    </div>

    <div class="body">
      <div class="success-icon" style="text-align:center;">🎉</div>
      <div class="greeting" style="text-align:center;">
        Welcome aboard, ${name}!
      </div>
      <p class="subtitle" style="text-align:center;">
        Your account has been successfully created.<br/>
        Get ready to book the best movie seats in town!
      </p>

      <div class="card">
        <div class="card-title">📋 Your Account Details</div>
        <div class="info-row">
          <span class="info-label">Name</span>
          <span class="info-value">${name}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Email</span>
          <span class="info-value">${email}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Account Type</span>
          <span class="info-value">
            <span class="badge">🎟️ Member</span>
          </span>
        </div>
        <div class="info-row">
          <span class="info-label">Status</span>
          <span class="info-value" style="color:#22c55e;">✅ Active</span>
        </div>
      </div>

      <div class="card">
        <div class="card-title">🚀 What You Can Do Now</div>
        <div style="padding: 8px 0; color: #a0a0c0; font-size: 14px; line-height: 2;">
          🎬 &nbsp;Browse latest movies<br/>
          🪑 &nbsp;Choose your favorite seats<br/>
          💳 &nbsp;Book tickets instantly<br/>
          📧 &nbsp;Get confirmation emails<br/>
          🎟️ &nbsp;Manage your bookings
        </div>
      </div>

      <div class="divider"></div>

      <p style="color:#6060a0; font-size:12px; text-align:center;">
        If you didn't create this account, please ignore this email.
      </p>
    </div>

    ${footerBlock()}
  `;

  return baseLayout(content, 'Welcome to CineBook!');
}

// ============================================================
// TEMPLATE 2: BOOKING CONFIRMATION EMAIL
// ============================================================
export function bookingConfirmationTemplate({
  customerName,
  customerEmail,
  bookingId,
  movieTitle,
  movieGenre,
  moviePoster,
  theater,
  showDate,
  showTime,
  seats,
  seatLabels,
  totalPrice,
  ticketPrice,
  qrCodeUrl,
}) {
  // ─── Format seats display ───────────────────────────────
  const seatList = seatLabels
    ? seatLabels
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const seatsDisplay = seatList.length > 0
    ? `<div class="seats-grid">
        ${seatList.map((s) => `<span class="seat-chip">${s}</span>`).join('')}
       </div>`
    : `<span class="info-value">${seats} seat(s)</span>`;

  // ─── Format date display ────────────────────────────────
  const formattedDate = showDate
    ? new Date(showDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : showDate;

  const content = `
    <div class="header">
      <h1>🎬 CINEBOOK</h1>
      <p>Booking Confirmation</p>
    </div>

    <div class="body">

      <!-- SUCCESS MESSAGE -->
      <div style="text-align:center; margin-bottom: 24px;">
        <div class="success-icon">✅</div>
        <div class="greeting">Booking Confirmed!</div>
        <p class="subtitle">
          Your tickets are reserved, ${customerName}!<br/>
          Show this email or QR code at the theater entrance.
        </p>
      </div>

      <!-- BOOKING ID -->
      <p style="color:#8080a0; font-size:12px; text-align:center; margin-bottom:6px;">
        BOOKING REFERENCE
      </p>
      <div class="booking-id"># ${bookingId}</div>

      <!-- QR CODE -->
      ${
        qrCodeUrl
          ? `<div class="qr-section">
              <img src="${qrCodeUrl}" alt="QR Code" />
              <div class="qr-label">📱 Scan at theater entrance</div>
             </div>`
          : ''
      }

      <!-- MOVIE INFO -->
      <div class="card">
        <div class="card-title">🎬 Movie Details</div>
        ${
          moviePoster
            ? `<div style="text-align:center; margin-bottom:14px;">
                <img
                  src="${moviePoster}"
                  alt="${movieTitle}"
                  style="height:120px; border-radius:8px; object-fit:cover;"
                  onerror="this.style.display='none'"
                />
               </div>`
            : ''
        }
        <div class="info-row">
          <span class="info-label">Movie</span>
          <span class="info-value highlight">${movieTitle}</span>
        </div>
        ${
          movieGenre
            ? `<div class="info-row">
                <span class="info-label">Genre</span>
                <span class="info-value">
                  <span class="badge">${movieGenre}</span>
                </span>
               </div>`
            : ''
        }
      </div>

      <!-- SHOWTIME INFO -->
      <div class="card">
        <div class="card-title">📅 Show Details</div>
        <div class="info-row">
          <span class="info-label">🏛️ Theater</span>
          <span class="info-value">${theater}</span>
        </div>
        <div class="info-row">
          <span class="info-label">📅 Date</span>
          <span class="info-value">${formattedDate}</span>
        </div>
        <div class="info-row">
          <span class="info-label">🕐 Time</span>
          <span class="info-value">${showTime}</span>
        </div>
      </div>

      <!-- SEATS INFO -->
      <div class="card">
        <div class="card-title">🪑 Seat Details</div>
        <div class="info-row">
          <span class="info-label">Total Seats</span>
          <span class="info-value">${seats} seat(s)</span>
        </div>
        ${
          seatList.length > 0
            ? `<div style="padding: 10px 0;">
                <div class="info-label" style="font-size:13px; margin-bottom:8px;">
                  Assigned Seats:
                </div>
                ${seatsDisplay}
               </div>`
            : ''
        }
        ${
          ticketPrice
            ? `<div class="info-row">
                <span class="info-label">Price per Seat</span>
                <span class="info-value">RM ${Number(ticketPrice).toFixed(2)}</span>
               </div>`
            : ''
        }
      </div>

      <!-- TOTAL PRICE -->
      <div class="price-box">
        <div>
          <div class="price-label">Total Amount Paid</div>
          <div style="color:rgba(255,255,255,0.7); font-size:12px;">
            ${seats} seat(s) × RM ${Number(ticketPrice || 0).toFixed(2)}
          </div>
        </div>
        <div class="price-amount">RM ${Number(totalPrice).toFixed(2)}</div>
      </div>

      <!-- CUSTOMER INFO -->
      <div class="card">
        <div class="card-title">👤 Customer Details</div>
        <div class="info-row">
          <span class="info-label">Name</span>
          <span class="info-value">${customerName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Email</span>
          <span class="info-value">${customerEmail}</span>
        </div>
      </div>

      <!-- INSTRUCTIONS -->
      <div class="card">
        <div class="card-title">📌 Important Reminders</div>
        <div style="font-size: 13px; color: #a0a0c0; line-height: 2.2;">
          🕐 &nbsp;Please arrive <strong style="color:#fff;">15 minutes early</strong><br/>
          📱 &nbsp;Show QR code or Booking ID at entrance<br/>
          🚫 &nbsp;No refunds after show starts<br/>
          🎟️ &nbsp;Keep this email as your ticket
        </div>
      </div>

    </div>

    ${footerBlock()}
  `;

  return baseLayout(content, `Booking Confirmed — ${movieTitle}`);
}

// ============================================================
// TEMPLATE 3: NEW MOVIE NOTIFICATION (admin optional feature)
// ============================================================
export function newMovieNotificationTemplate({
  movieTitle,
  movieGenre,
  movieRating,
  moviePoster,
  releaseYear,
  description,
}) {
  const content = `
    <div class="header">
      <h1>🎬 CINEBOOK</h1>
      <p>New Movie Now Available!</p>
    </div>

    <div class="body">
      <div style="text-align:center; margin-bottom:24px;">
        <div class="success-icon">🎞️</div>
        <div class="greeting">New Movie Alert!</div>
        <p class="subtitle">
          A brand new movie has just been added to CineBook.<br/>
          Book your seats before they run out!
        </p>
      </div>

      ${
        moviePoster
          ? `<div style="text-align:center; margin-bottom:20px;">
              <img
                src="${moviePoster}"
                alt="${movieTitle}"
                style="max-width:200px; border-radius:12px; border: 2px solid #e50914;"
              />
             </div>`
          : ''
      }

      <div class="card">
        <div class="card-title">🎬 Movie Information</div>
        <div class="info-row">
          <span class="info-label">Title</span>
          <span class="info-value highlight">${movieTitle}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Genre</span>
          <span class="info-value">
            <span class="badge">${movieGenre}</span>
          </span>
        </div>
        <div class="info-row">
          <span class="info-label">Rating</span>
          <span class="info-value">⭐ ${movieRating}/10</span>
        </div>
        <div class="info-row">
          <span class="info-label">Year</span>
          <span class="info-value">${releaseYear}</span>
        </div>
      </div>

      ${
        description
          ? `<div class="card">
              <div class="card-title">📖 Synopsis</div>
              <p style="color:#a0a0c0; font-size:14px; line-height:1.8;">
                ${description}
              </p>
             </div>`
          : ''
      }

    </div>

    ${footerBlock()}
  `;

  return baseLayout(content, `New Movie: ${movieTitle}`);
}