import sqlite3
import os

# Set correct directories/paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(BASE_DIR, "orders.db")
schema_path = os.path.join(BASE_DIR, "schema.sql")

connection = sqlite3.connect(db_path)

# Create database through executing the Schema.sql script
with open(schema_path) as f:
    connection.executescript(f.read())

connection.commit()
connection.close()

# Feedback
print("✅ Database tables created successfully!")