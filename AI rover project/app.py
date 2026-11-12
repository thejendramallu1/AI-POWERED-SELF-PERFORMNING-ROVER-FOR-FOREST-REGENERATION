from flask import Flask, render_template, jsonify
import random

app = Flask(__name__)

# Backend Data Layer - Simulating Database Connection
ROVE_DATA = [
    { 'id': 'RX-01', 'status': 'online', 'battery': 84, 'speed': 4.2, 'seedsPlanted': 1240, 'seedsAvailable': 5000, 'location': 'Sector 4, Alpha Zone' },
    { 'id': 'RX-02', 'status': 'online', 'battery': 91, 'speed': 3.8, 'seedsPlanted': 980, 'seedsAvailable': 4500, 'location': 'Sector 2, Beta Zone' },
    { 'id': 'RX-03', 'status': 'charging', 'battery': 12, 'speed': 0.0, 'seedsPlanted': 1850, 'seedsAvailable': 1200, 'location': 'Base Station A' },
    { 'id': 'RX-04', 'status': 'issue', 'battery': 54, 'speed': 0.0, 'seedsPlanted': 420, 'seedsAvailable': 4800, 'location': 'Sector 7, Rugged Terrain' },
    { 'id': 'RX-05', 'status': 'online', 'battery': 76, 'speed': 4.5, 'seedsPlanted': 1105, 'seedsAvailable': 3895, 'location': 'Sector 1, Delta Zone' },
    { 'id': 'RX-06', 'status': 'online', 'battery': 65, 'speed': 3.2, 'seedsPlanted': 1300, 'seedsAvailable': 3700, 'location': 'Sector 3, Gamma Zone' },
    { 'id': 'RX-07', 'status': 'online', 'battery': 89, 'speed': 4.0, 'seedsPlanted': 1450, 'seedsAvailable': 3550, 'location': 'Sector 4, Alpha Zone' },
    { 'id': 'RX-08', 'status': 'online', 'battery': 43, 'speed': 3.7, 'seedsPlanted': 1560, 'seedsAvailable': 3440, 'location': 'Sector 5, Epsilon Zone' }
]

@app.route('/')
def dashboard():
    """Renders the main dashboard webpage."""
    return render_template('index.html')

@app.route('/api/rovers', methods=['GET'])
def api_rovers():
    """Serves real-time data for the Rover Fleet Dashboard."""
    # In a real environment, this data would be fetched from a DB (like SQLite/Postgres)
    # We will simulate a bit of variance for active rovers
    
    for r in ROVE_DATA:
        if r['status'] == 'online':
            # Minor battery drain simulation
            r['battery'] = max(0, r['battery'] - round(random.uniform(0, 0.5), 1))
    
    return jsonify(ROVE_DATA)

if __name__ == '__main__':
    # Launch on Port 8080 because port 5500 is blocked by IDE Live Server
    app.run(host='0.0.0.0', port=8080, debug=True)
