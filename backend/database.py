import sqlite3


DATABASE_NAME = "trustlayer.db"


def get_connection():

    conn = sqlite3.connect(DATABASE_NAME)

    conn.row_factory = sqlite3.Row

    return conn

def create_tables():

    conn = get_connection()

    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS transactions (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        transaction_id TEXT,

        amount INTEGER,

        timestamp TEXT,

        buyer_id TEXT,

        buyer_account_age_days INTEGER,

        vendor_id TEXT,

        vendor_account_age_days INTEGER,

        vendor_category TEXT,

        arrival_source TEXT,

        time_on_page_seconds INTEGER,

        device_fingerprint TEXT,

        avg_transaction_amount REAL,

        total_past_transactions INTEGER,

        past_dispute_count INTEGER,

        label INTEGER
    )
    """)

    conn.commit()

    conn.close()

def insert_transaction(row):

    conn = get_connection()

    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO transactions (

        transaction_id,
        amount,
        timestamp,
        buyer_id,
        buyer_account_age_days,
        vendor_id,
        vendor_account_age_days,
        vendor_category,
        arrival_source,
        time_on_page_seconds,
        device_fingerprint,
        avg_transaction_amount,
        total_past_transactions,
        past_dispute_count,
        label

    )

    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (

        row["transaction"]["id"],
        row["transaction"]["amount"],
        row["transaction"]["timestamp"],

        row["buyer"]["id"],
        row["buyer"]["account_age_days"],

        row["vendor"]["id"],
        row["vendor"]["account_age_days"],
        row["vendor"]["category"],

        row["session"]["arrival_source"],
        row["session"]["time_on_page_seconds"],
        row["session"]["device_fingerprint"],

        row["buyer_profile"]["avg_transaction_amount"],
        row["buyer_profile"]["total_past_transactions"],
        row["buyer_profile"]["past_dispute_count"],

        row["label"]
    ))

    conn.commit()

    conn.close()

def fetch_training_transactions():

    conn = get_connection()

    cursor = conn.cursor()

    cursor.execute("""
    SELECT *
    FROM transactions
    """)

    rows = cursor.fetchall()

    conn.close()

    return rows

if __name__ == "__main__":

    create_tables()

    print("Database tables created.")