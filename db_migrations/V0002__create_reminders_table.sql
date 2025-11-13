CREATE TABLE IF NOT EXISTS reminders (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER,
    reminder_type VARCHAR(50) NOT NULL,
    reminder_text TEXT NOT NULL,
    send_at TIMESTAMP NOT NULL,
    sent BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP,
    client_email VARCHAR(255),
    client_phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reminder_send_at ON reminders(send_at);
CREATE INDEX idx_reminder_sent ON reminders(sent);
CREATE INDEX idx_reminder_booking_id ON reminders(booking_id);