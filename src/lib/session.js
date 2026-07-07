const SESSION_EMAIL_KEY = "moledi_session_email";

export function getOrganizerSessionEmail() {
  try {
    return sessionStorage.getItem(SESSION_EMAIL_KEY) || "";
  } catch {
    return "";
  }
}

export function setOrganizerSessionEmail(email) {
  try {
    sessionStorage.setItem(SESSION_EMAIL_KEY, email || "");
  } catch {
    // sessionStorage indisponible
  }
}

export function clearOrganizerSession() {
  try {
    sessionStorage.removeItem(SESSION_EMAIL_KEY);
  } catch {
    // no-op
  }
}